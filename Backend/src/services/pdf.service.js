const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const permisRepository = require('../repositories/permis.repository');

class PDFService {
  async genererPDFPermis(permisId) {
    try {
      const permis = await permisRepository.findById(permisId);
      if (!permis) {
        throw new Error('Permis non trouvé');
      }

      const approbations = await permisRepository.getApprovals(permisId);
      const html = await this.genererHTMLPermis(permis, approbations);

      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // ✅ Attendre que le contenu soit complètement chargé
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await browser.close();

      // ✅ Sauvegarder le PDF
      const pdfDir = path.join(process.env.UPLOAD_DIR || './uploads', 'pdfs');
      await fs.mkdir(pdfDir, { recursive: true });
      const pdfPath = path.join(pdfDir, `permis-${permis.numero_permis}.pdf`);
      await fs.writeFile(pdfPath, pdfBuffer);

      // ✅ Générer et sauvegarder le hash du PDF
      const pdfHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
      
      // Sauvegarder le hash dans la base de données
      await permisRepository.update(permisId, { 
        pdf_hash: pdfHash,
        pdf_path: pdfPath,
        pdf_date_generation: new Date()
      });

      console.log('✅ PDF généré avec succès:', pdfPath);
      console.log('📝 Hash PDF:', pdfHash);

      return { buffer: pdfBuffer, path: pdfPath, hash: pdfHash };
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw error;
    }
  }

  async genererHTMLPermis(permis, approbations) {
    // ✅ Fonction helper pour formater les dates
    const formatDate = (date) => {
      if (!date) return '-';
      try {
        return new Date(date).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return '-';
      }
    };

    // ✅ Fonction helper pour échapper HTML
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // ✅ Construire le HTML des approbations
    const approbationsHTML = approbations.length > 0 
      ? approbations.map(app => `
        <tr>
          <td>${escapeHtml(app.role_app)}</td>
          <td>${escapeHtml(app.nom)} ${escapeHtml(app.prenom)}</td>
          <td><span class="status-badge">${escapeHtml(app.statut)}</span></td>
          <td>${formatDate(app.date_action)}</td>
          <td>${escapeHtml(app.commentaire || '-')}</td>
          <td style="font-family: monospace; font-size: 9px; word-break: break-all;">
            ${app.signature_hash ? app.signature_hash.substring(0, 20) + '...' : '-'}
          </td>
        </tr>
      `).join('')
      : '<tr><td colspan="6" style="text-align: center; color: #6b7280;">Aucune approbation enregistrée</td></tr>';

    // ✅ Construire le HTML des conditions
    const conditionsHTML = (() => {
      try {
        const conditions = typeof permis.conditions_prealables === 'string' 
          ? JSON.parse(permis.conditions_prealables) 
          : permis.conditions_prealables;
        
        if (!conditions || Object.keys(conditions).length === 0) {
          return '<li>Aucune condition spécifiée</li>';
        }
        
        return Object.entries(conditions)
          .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`)
          .join('');
      } catch (e) {
        return '<li>Aucune condition spécifiée</li>';
      }
    })();

    // ✅ Construire le HTML des mesures
    const mesuresHTML = (() => {
      try {
        const mesures = typeof permis.mesures_prevention === 'string'
          ? JSON.parse(permis.mesures_prevention)
          : permis.mesures_prevention;
        
        if (!mesures || Object.keys(mesures).length === 0) {
          return '<li>Aucune mesure spécifiée</li>';
        }
        
        return Object.entries(mesures)
          .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`)
          .join('');
      } catch (e) {
        return '<li>Aucune mesure spécifiée</li>';
      }
    })();

    // ✅ Déterminer la classe CSS du statut
    const getStatusClass = (statut) => {
      const map = {
        'BROUILLON': 'brouillon',
        'EN_ATTENTE': 'attente',
        'VALIDE': 'valide',
        'EN_COURS': 'cours',
        'SUSPENDU': 'suspendu',
        'CLOTURE': 'cloture'
      };
      return map[statut] || 'brouillon';
    };

    // ✅ Charger le template
    const templatePath = path.join(__dirname, '../templates/permis-pdf.html');
    let html;
    
    try {
      html = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.warn('⚠️ Template non trouvé, utilisation du template par défaut');
      html = this.getDefaultTemplate();
    }

    // ✅ Remplacer tous les placeholders avec gestion des valeurs nulles
    html = html
      .replace(/{{NUMERO_PERMIS}}/g, escapeHtml(permis.numero_permis || 'N/A'))
      .replace(/{{TITRE}}/g, escapeHtml(permis.titre || 'Sans titre'))
      .replace(/{{DESCRIPTION}}/g, escapeHtml(permis.description || 'Aucune description'))
      .replace(/{{TYPE_PERMIS}}/g, escapeHtml(permis.type_permis_nom || 'N/A'))
      .replace(/{{ZONE}}/g, escapeHtml(permis.zone_nom || 'N/A'))
      .replace(/{{DEMANDEUR}}/g, escapeHtml(`${permis.demandeur_nom || ''} ${permis.demandeur_prenom || ''}`.trim() || 'N/A'))
      .replace(/{{DATE_DEBUT}}/g, formatDate(permis.date_debut))
      .replace(/{{DATE_FIN}}/g, formatDate(permis.date_fin))
      .replace(/{{STATUT}}/g, escapeHtml(permis.statut || 'BROUILLON'))
      .replace(/{{STATUT_CLASS}}/g, getStatusClass(permis.statut))
      .replace(/{{CONDITIONS}}/g, conditionsHTML)
      .replace(/{{MESURES}}/g, mesuresHTML)
      .replace(/{{APPROBATIONS}}/g, approbationsHTML)
      .replace(/{{DATE_GENERATION}}/g, formatDate(new Date()));

    return html;
  }

  // ✅ Template HTML par défaut si le fichier n'existe pas
  getDefaultTemplate() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Permis {{NUMERO_PERMIS}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { color: #2563eb; font-size: 24pt; margin-bottom: 5px; }
    .section { margin-bottom: 20px; page-break-inside: avoid; }
    .section-title { background: #dbeafe; padding: 8px 12px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { border: 1px solid #e5e7eb; padding: 10px; border-radius: 4px; }
    .info-label { font-size: 9pt; color: #6b7280; text-transform: uppercase; margin-bottom: 3px; }
    .info-value { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 9pt; font-weight: bold; }
    .status-cours { background: #dcfce7; color: #166534; }
    .status-valide { background: #dbeafe; color: #1e40af; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 12px; margin-bottom: 6px; background: #f0fdf4; border-left: 3px solid #10b981; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PERMIS DE TRAVAIL HSE</h1>
    <div>{{NUMERO_PERMIS}}</div>
  </div>
  <div class="section">
    <div class="section-title">INFORMATIONS GÉNÉRALES</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Titre</div><div class="info-value">{{TITRE}}</div></div>
      <div class="info-item"><div class="info-label">Type</div><div class="info-value">{{TYPE_PERMIS}}</div></div>
      <div class="info-item"><div class="info-label">Zone</div><div class="info-value">{{ZONE}}</div></div>
      <div class="info-item"><div class="info-label">Demandeur</div><div class="info-value">{{DEMANDEUR}}</div></div>
      <div class="info-item"><div class="info-label">Début</div><div class="info-value">{{DATE_DEBUT}}</div></div>
      <div class="info-item"><div class="info-label">Fin</div><div class="info-value">{{DATE_FIN}}</div></div>
    </div>
    <div class="info-item" style="margin-top: 15px;">
      <div class="info-label">Statut</div>
      <span class="status-badge status-{{STATUT_CLASS}}">{{STATUT}}</span>
    </div>
    <div style="margin-top: 15px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">
      <div class="info-label">Description</div>
      <p style="margin-top: 8px;">{{DESCRIPTION}}</p>
    </div>
  </div>
  <div class="section">
    <div class="section-title">CONDITIONS PRÉALABLES</div>
    <ul>{{CONDITIONS}}</ul>
  </div>
  <div class="section">
    <div class="section-title">MESURES DE PRÉVENTION</div>
    <ul>{{MESURES}}</ul>
  </div>
  <div class="section">
    <div class="section-title">APPROBATIONS</div>
    <table>
      <thead><tr><th>Rôle</th><th>Nom</th><th>Statut</th><th>Date</th><th>Commentaire</th><th>Signature</th></tr></thead>
      <tbody>{{APPROBATIONS}}</tbody>
    </table>
  </div>
  <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 9pt; color: #6b7280;">
    <p><strong>Généré le:</strong> {{DATE_GENERATION}}</p>
    <p style="margin-top: 5px;">Document certifié - Toute modification est interdite</p>
  </div>
</body>
</html>`;
  }

async verifierIntegritePDF(permisId) {
  try {
    console.log('=================================================');
    console.log('🔍 DÉBUT VÉRIFICATION PDF');
    console.log('   Permis ID:', permisId);
    console.log('=================================================');

    const permis = await permisRepository.findById(permisId);
    
    console.log('📄 Permis trouvé:', {
      id: permis?.id,
      numero: permis?.numero_permis,
      has_pdf_hash: !!permis?.pdf_hash,
      has_pdf_path: !!permis?.pdf_path,
      pdf_hash: permis?.pdf_hash?.substring(0, 20) + '...',
      pdf_path: permis?.pdf_path
    });

    if (!permis) {
      console.log('❌ Permis non trouvé');
      return {
        success: false,
        isValid: false,
        message: 'Permis non trouvé',
        details: { hasPDF: false }
      };
    }

    if (!permis.pdf_hash || !permis.pdf_path) {
      console.log('⚠️ Aucun PDF généré pour ce permis');
      console.log('   pdf_hash:', permis.pdf_hash);
      console.log('   pdf_path:', permis.pdf_path);
      
      return {
        success: false,
        isValid: false,
        message: 'Aucun PDF généré pour ce permis. Veuillez d\'abord l\'exporter.',
        details: { 
          hasPDF: false,
          permisId: permisId,
          suggestion: 'Utilisez le bouton "Exporter PDF" d\'abord'
        }
      };
    }

    // Vérifier existence fichier
    console.log('📁 Vérification existence fichier:', permis.pdf_path);
    
    try {
      await fs.access(permis.pdf_path);
      console.log('✅ Fichier existe');
    } catch (err) {
      console.log('❌ Fichier n\'existe pas:', err.message);
      return {
        success: false,
        isValid: false,
        message: 'Le fichier PDF n\'existe plus. Veuillez le régénérer.',
        details: { fileExists: false, path: permis.pdf_path }
      };
    }

    // Lire et calculer hash
    console.log('🔐 Calcul du hash...');
    const pdfBuffer = await fs.readFile(permis.pdf_path);
    const currentHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    const hashMatch = currentHash === permis.pdf_hash;

    console.log('🔐 Comparaison hash:', {
      enregistre: permis.pdf_hash.substring(0, 30) + '...',
      actuel: currentHash.substring(0, 30) + '...',
      match: hashMatch
    });

    if (!hashMatch) {
      console.log('⚠️⚠️⚠️ HASH NE CORRESPOND PAS! ⚠️⚠️⚠️');
    }

    // Vérifier signatures
    console.log('✍️ Vérification des signatures...');
    const approbations = await permisRepository.getApprovals(permisId);
    console.log(`   Nombre d'approbations: ${approbations.length}`);

    const signaturesVerifications = approbations.map((app, idx) => {
      console.log(`   Approbation ${idx + 1}:`, {
        utilisateur: `${app.nom} ${app.prenom}`,
        role: app.role_app,
        has_signature: !!app.signature_hash,
        date: app.date_action
      });

      if (!app.signature_hash) {
        return {
          utilisateur: `${app.nom} ${app.prenom}`,
          role: app.role_app,
          valide: false,
          raison: 'Aucune signature'
        };
      }

      const expectedHash = crypto
        .createHash('sha256')
        .update(`${permisId}${app.utilisateur_id}${app.date_action}${process.env.PDF_SERVER_SECRET || 'default-secret'}`)
        .digest('hex');

      const signatureValide = app.signature_hash === expectedHash;

      console.log(`      Hash attendu: ${expectedHash.substring(0, 20)}...`);
      console.log(`      Hash enregistré: ${app.signature_hash.substring(0, 20)}...`);
      console.log(`      Valide: ${signatureValide}`);

      return {
        utilisateur: `${app.nom} ${app.prenom}`,
        role: app.role_app,
        date: app.date_action,
        valide: signatureValide,
        raison: signatureValide ? 'Signature valide' : 'Signature altérée'
      };
    });

    const toutesSignaturesValides = signaturesVerifications.every(v => v.valide);
    const isValid = hashMatch && toutesSignaturesValides;

    console.log('=================================================');
    console.log('📊 RÉSULTAT FINAL:', {
      isValid,
      pdfIntegre: hashMatch,
      signaturesValides: toutesSignaturesValides
    });
    console.log('=================================================');

    const result = {
      success: true,
      isValid,
      message: isValid 
        ? 'PDF et signatures vérifiés avec succès' 
        : 'Problème d\'intégrité détecté',
      details: {
        pdfIntegre: hashMatch,
        hashEnregistre: permis.pdf_hash.substring(0, 20) + '...',
        hashActuel: currentHash.substring(0, 20) + '...',
        dateGeneration: permis.pdf_date_generation,
        signaturesValides: toutesSignaturesValides,
        nombreApprobations: approbations.length,
        verifications: signaturesVerifications
      }
    };

    console.log('📤 Retour de la fonction:', JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.error('=================================================');
    console.error('❌❌❌ ERREUR DANS verifierIntegritePDF ❌❌❌');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('=================================================');
    
    return {
      success: false,
      isValid: false,
      message: `Erreur: ${error.message}`,
      details: { error: error.message, stack: error.stack }
    };
  }
}

}

module.exports = new PDFService();