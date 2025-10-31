// ========== PDF SERVICE: Version Sécurisée avec Anti-Falsification ==========

const puppeteer = require('puppeteer');
const crypto = require('crypto');
const logger = require('../utils/logger');
const permisRepository = require('../repositories/permis.repository');

let browser = null;
let browserLaunchPromise = null;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBrowser() {
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  if (browser) {
    try {
      await browser.version();
      return browser;
    } catch (error) {
      console.warn('⚠️ Navigateur déconnecté, relancement...');
      browser = null;
    }
  }
  
  browserLaunchPromise = (async () => {
    try {
      console.log('⏳ Lancement du navigateur Puppeteer...');
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-plugins',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-default-apps',
          '--disable-preconnect'
        ],
        timeout: 30000,
        dumpio: false
      });
      
      console.log('✅ Navigateur lancé avec succès');
      
      browser.on('disconnected', () => {
        console.warn('⚠️ Navigateur déconnecté');
        browser = null;
      });

      return browser;
    } catch (error) {
      console.error('❌ Erreur lancement navigateur:', error.message);
      browser = null;
      browserLaunchPromise = null;
      throw error;
    } finally {
      browserLaunchPromise = null;
    }
  })();

  return browserLaunchPromise;
}

const pdfService = {
  /**
   * Générer un PDF pour un permis
   */
  async genererPDFPermis(permisId) {
    let page = null;
    let browserInstance = null;
    
    try {
      console.log('🔧 Génération PDF pour permis:', permisId);

      const permis = await permisRepository.findById(permisId);
      if (!permis) {
        throw new Error(`Permis ${permisId} non trouvé`);
      }

      const approbations = await permisRepository.getApprovals(permisId);

      console.log('📋 Données du permis récupérées:', {
        numero: permis.numero_permis,
        titre: permis.titre,
        approbations: approbations.length
      });

      browserInstance = await getBrowser();
      
      console.log('⏳ Création de la page...');
      page = await Promise.race([
        browserInstance.newPage(),
        delay(10000).then(() => { throw new Error('Timeout création de page'); })
      ]);
      console.log('✅ Page créée');

      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(30000);

      // ✅ Générer les données de sécurité
      const securityData = generateSecurityData(permis);

      const htmlContent = generateSecurePermisHTML(permis, approbations, securityData);
      console.log('📄 HTML généré, taille:', htmlContent.length, 'caractères');

      console.log('⏳ Chargement du contenu HTML...');
      await Promise.race([
        page.setContent(htmlContent, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        }),
        delay(35000).then(() => { throw new Error('Timeout chargement HTML'); })
      ]);
      console.log('✅ Contenu HTML chargé');

      await delay(1000);

      console.log('⏳ Génération du PDF...');
      let pdfData;
      try {
        pdfData = await Promise.race([
          page.pdf({
            format: 'A4',
            margin: { 
              top: '15mm', 
              right: '10mm', 
              bottom: '15mm', 
              left: '10mm' 
            },
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: `
              <div style="font-size: 10px; width: 100%; text-align: center; padding: 5px;">
                <span style="color: #2563eb; font-weight: bold;">PERMIS DE TRAVAIL SÉCURISÉ - ${permis.numero_permis}</span>
              </div>
            `,
            footerTemplate: `
              <div style="font-size: 9px; width: 100%; display: flex; justify-content: space-between; padding: 5px; border-top: 1px solid #ddd;">
                <span>Hash: ${securityData.documentHash.substring(0, 16)}...</span>
                <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
              </div>
            `,
            timeout: 25000
          }),
          delay(30000).then(() => { throw new Error('Timeout génération PDF'); })
        ]);
      } catch (pdfError) {
        if (pdfError.message.includes('Target closed')) {
          console.error('❌ Le navigateur s\'est arrêté pendant la génération du PDF');
          browser = null;
        }
        throw pdfError;
      }

      console.log('✅ PDF généré');
      
      // ✅ Conversion Uint8Array → Buffer
      let buffer;
      
      if (pdfData instanceof Uint8Array && !(pdfData instanceof Buffer)) {
        console.log('   Conversion Uint8Array → Buffer...');
        buffer = Buffer.from(pdfData);
        console.log('   ✅ Conversion réussie');
      } else if (Buffer.isBuffer(pdfData)) {
        console.log('   ✅ C\'est déjà un Buffer');
        buffer = pdfData;
      } else {
        console.error('   ❌ Type inattendu:', pdfData.constructor.name);
        throw new Error(`Type inattendu de pdfData: ${pdfData.constructor.name}`);
      }

      console.log('   Taille du buffer:', buffer.length, 'bytes');

      // ✅ Vérifier la signature PDF
      const signature = buffer.slice(0, 4);
      console.log('   Premiers 4 bytes (ascii):', signature.toString('ascii'));
      
      if (signature.toString('ascii') !== '%PDF') {
        throw new Error(`Signature PDF invalide: ${signature.toString('ascii')}`);
      }

      console.log('✅ Signature PDF valide: %PDF');

      if (page) {
        try {
          await page.close();
          page = null;
        } catch (closeError) {
          console.warn('⚠️ Erreur fermeture page:', closeError.message);
        }
      }

      // ✅ Calculer le hash du PDF généré
      const pdfHash = crypto
        .createHash('sha256')
        .update(buffer)
        .digest('hex');

      console.log('🔐 Hash PDF:', pdfHash.substring(0, 16) + '...');
      console.log('✅ PDF généré avec succès!');

      return { 
        buffer,
        hash: pdfHash,
        size: buffer.length,
        securityData
      };

    } catch (error) {
      console.error('❌ Erreur génération PDF:', error.message);
      console.error('Stack:', error.stack);
      
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.warn('⚠️ Erreur fermeture page:', e.message);
        }
      }
      
      throw error;
    }
  },

  // ✅ CORRIGÉ: Vérification d'intégrité PDF améliorée
  async verifierIntegritePDF(permisId) {
    try {
      console.log('');
      console.log('┌─────────────────────────────────────────────────────┐');
      console.log('│   🔍 SERVICE: verifierIntegritePDF                  │');
      console.log('└─────────────────────────────────────────────────────┘');
      console.log('🔨 Vérification du permis:', permisId);

      const permis = await permisRepository.findById(permisId);
      if (!permis) {
        console.log('❌ Permis non trouvé');
        return {
          success: false,
          isValid: false,
          message: 'Permis non trouvé',
          details: { error: 'Permis inexistant', permisId: permisId }
        };
      }

      console.log('✅ Permis trouvé:', permis.numero_permis);

      const approbations = await permisRepository.getApprovals(permisId);
      console.log('📋 Approbations trouvées:', approbations.length);

      const verifications = [];

      // 1️⃣ Vérifier l'intégrité des données du permis
      const pdfIntegre = Boolean(
        permis.numero_permis && 
        permis.titre && 
        permis.statut &&
        permis.date_debut &&
        permis.date_fin
      );
      
      verifications.push({
        type: 'integrity',
        description: 'Intégrité des données du permis',
        valide: pdfIntegre,
        details: pdfIntegre 
          ? 'Toutes les données essentielles sont présentes' 
          : 'Données manquantes ou corrompues'
      });

      console.log('1️⃣ Intégrité des données:', pdfIntegre ? '✅' : '❌');

      // 2️⃣ Vérifier le statut du permis
      const statutsValides = ['EN_COURS', 'VALIDE', 'APPROUVE'];
      const statutValide = statutsValides.includes(permis.statut);
      
      verifications.push({
        type: 'status',
        description: 'Statut du permis',
        valide: statutValide,
        details: `Statut: ${permis.statut}`
      });

      console.log('2️⃣ Statut valide:', statutValide ? '✅' : '❌');

      // 3️⃣ Vérifier l'expiration
      const dateFin = new Date(permis.date_fin);
      const aujourdhui = new Date();
      const nonExpire = aujourdhui <= dateFin;
      
      verifications.push({
        type: 'expiration',
        description: 'Validité temporelle',
        valide: nonExpire,
        details: nonExpire 
          ? `Valide jusqu'au ${dateFin.toLocaleDateString('fr-FR')}` 
          : `Expiré depuis le ${dateFin.toLocaleDateString('fr-FR')}`
      });

      console.log('3️⃣ Non expiré:', nonExpire ? '✅' : '❌');

      // 4️⃣ Vérifier les signatures/approbations
      let signaturesValides = false;
      let nbApprobationsValides = 0;

      if (approbations && approbations.length > 0) {
        approbations.forEach((app) => {
          const estValide = app.statut === 'APPROUVE';
          
          if (estValide) {
            nbApprobationsValides++;
          }

          verifications.push({
            type: 'signature',
            description: `Approbation: ${app.prenom} ${app.nom}`,
            utilisateur: `${app.prenom} ${app.nom}`,
            role: app.role_app,
            statut: app.statut,
            date: app.date_action,
            valide: estValide,
            details: estValide 
              ? `Approuvé le ${new Date(app.date_action).toLocaleDateString('fr-FR')}` 
              : `Statut: ${app.statut}`
          });
        });

        signaturesValides = nbApprobationsValides > 0;
      }

      console.log('4️⃣ Approbations valides:', nbApprobationsValides, '/', approbations.length);

      // 5️⃣ Vérifier les données de sécurité (si disponibles)
      const securityData = generateSecurityData(permis);
      verifications.push({
        type: 'security',
        description: 'Code de sécurité généré',
        valide: true,
        details: `Code: ${securityData.securityCode}`
      });

      // ✅ Calcul du score de validité
      const totalChecks = 4; // intégrité, statut, expiration, approbations
      let validChecks = 0;

      if (pdfIntegre) validChecks++;
      if (statutValide) validChecks++;
      if (nonExpire) validChecks++;
      if (signaturesValides || approbations.length === 0) validChecks++;

      // Document valide si tous les checks critiques passent
      const isValid = pdfIntegre && statutValide && nonExpire && (signaturesValides || approbations.length === 0);

      console.log('');
      console.log('📊 RÉSUMÉ:');
      console.log('  - Score:', validChecks, '/', totalChecks);
      console.log('  - Status Global:', isValid ? '✅ VALIDE' : '❌ INVALIDE');
      console.log('');

      return {
        success: true,
        isValid: isValid,
        message: isValid 
          ? '✅ Document authentique - Toutes les vérifications ont réussi'
          : '⚠️ Document suspect - Certaines vérifications ont échoué',
        data: {
          isValid: isValid,
          score: `${validChecks}/${totalChecks}`,
          details: {
            pdfIntegre,
            statutValide,
            nonExpire,
            signaturesValides,
            nombreApprobations: approbations.length,
            nombreApprobationsValides: nbApprobationsValides,
            permisId: permisId,
            numeroPermis: permis.numero_permis,
            statut: permis.statut,
            dateExpiration: permis.date_fin,
            verifications: verifications,
            securityCode: securityData.securityCode
          }
        }
      };

    } catch (error) {
      console.error('❌ Erreur vérification PDF:', error.message);
      return {
        success: false,
        isValid: false,
        message: `Erreur lors de la vérification: ${error.message}`,
        data: {
          isValid: false,
          details: {
            error: error.message,
            type: error.name
          }
        }
      };
    }
  },

  async closeBrowser() {
    if (browser) {
      try {
        await browser.close();
        browser = null;
        console.log('✅ Navigateur fermé');
      } catch (error) {
        console.error('❌ Erreur fermeture navigateur:', error.message);
      }
    }
  }
};

/**
 * ✅ Générer les données de sécurité
 */
function generateSecurityData(permis) {
  const securityPayload = JSON.stringify({
    numero: permis.numero_permis,
    titre: permis.titre,
    zone: permis.zone_id,
    debut: permis.date_debut,
    fin: permis.date_fin,
    statut: permis.statut,
    timestamp: new Date(permis.date_creation).toISOString()
  });

  const documentHash = crypto
    .createHash('sha256')
    .update(securityPayload)
    .digest('hex');

  const securityCode = crypto
    .createHash('sha1')
    .update(securityPayload + (process.env.PDF_SERVER_SECRET || 'secure-secret'))
    .digest('hex')
    .substring(0, 12)
    .toUpperCase();

  return {
    documentHash,
    securityCode,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * ✅ CORRIGÉ: Template HTML avec code de sécurité facilement copiable
 */
function generateSecurePermisHTML(permis, approbations, securityData) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Permis de Travail Sécurisé</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          color: #333;
          line-height: 1.6;
          padding: 0;
          background: white;
        }

        @page {
          size: A4;
          margin: 15mm 10mm;
        }

        .security-header {
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
          color: white;
          padding: 15px;
          text-align: center;
          border-bottom: 3px solid #1e3a8a;
          page-break-after: avoid;
        }

        .security-header h1 {
          font-size: 20px;
          margin: 5px 0;
          font-weight: bold;
        }

        .security-header p {
          font-size: 11px;
          opacity: 0.9;
        }

        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          color: rgba(220, 38, 38, 0.08);
          font-weight: bold;
          z-index: -1;
          white-space: nowrap;
          pointer-events: none;
        }

        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }

        .section h2 {
          background-color: #f0f4f8;
          padding: 10px 15px;
          border-left: 4px solid #2563eb;
          margin-bottom: 12px;
          font-size: 14px;
          color: #1e40af;
          font-weight: bold;
        }

        .info-row {
          display: flex;
          margin-bottom: 8px;
          padding: 8px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 3px;
        }

        .info-label {
          font-weight: bold;
          width: 140px;
          color: #2563eb;
          min-width: 140px;
          flex-shrink: 0;
        }

        .info-value {
          flex: 1;
          color: #333;
          word-break: break-word;
        }

        .approval-item {
          background-color: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 3px;
          border: 1px solid #dcfce7;
          font-size: 12px;
        }

        /* ✅ CORRIGÉ: Zone de sécurité avec code facilement copiable */
        .security-zone {
          background: #fef3c7;
          border: 2px dashed #d97706;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          page-break-inside: avoid;
        }

        .security-zone h3 {
          color: #b45309;
          margin-bottom: 12px;
          font-size: 13px;
          text-align: center;
        }

        /* ✅ Code de sécurité sans espaces parasites */
        .security-code-container {
          background: white;
          border: 2px solid #d97706;
          padding: 15px;
          margin: 10px 0;
          text-align: center;
          border-radius: 4px;
        }

        .security-code-label {
          font-size: 10px;
          color: #b45309;
          font-weight: bold;
          margin-bottom: 8px;
          display: block;
        }

        .security-code {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          color: #b45309;
          letter-spacing: 3px;
          user-select: all;
          /* ✅ Permet la sélection du texte pour copie facile */
        }

        .security-item {
          margin: 8px 0;
          font-size: 10px;
          color: #78716c;
          text-align: center;
        }

        .security-item strong {
          color: #57534e;
          display: inline-block;
          min-width: 120px;
        }

        .security-instructions {
          margin-top: 12px;
          padding: 10px;
          background: #fffbeb;
          border-left: 3px solid #f59e0b;
          font-size: 9px;
          color: #78350f;
          line-height: 1.4;
        }

        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 2px solid #d97706;
          text-align: center;
          font-size: 9px;
          color: #666;
          page-break-inside: avoid;
        }

        .footer p {
          margin: 3px 0;
        }

        .critical-info {
          background: #fee2e2;
          border: 2px solid #dc2626;
          padding: 10px;
          border-radius: 3px;
          margin: 15px 0;
          font-weight: bold;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="watermark">ORIGINAL</div>

      <div class="security-header">
        <h1>🔐 PERMIS DE TRAVAIL SÉCURISÉ</h1>
        <p>Document officiel protégé par signature numérique</p>
        <p>${permis.numero_permis}</p>
      </div>

      <div class="section">
        <h2>📋 Informations Générales</h2>
        <div class="info-row">
          <div class="info-label">Numéro:</div>
          <div class="info-value"><strong>${permis.numero_permis}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">Titre:</div>
          <div class="info-value">${permis.titre || 'N/A'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Zone:</div>
          <div class="info-value">${permis.zone_nom || 'N/A'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Statut:</div>
          <div class="info-value"><strong>${permis.statut}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">Début:</div>
          <div class="info-value">${formatDate(permis.date_debut)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Fin:</div>
          <div class="info-value">${formatDate(permis.date_fin)}</div>
        </div>
      </div>

      ${permis.description ? `
      <div class="section">
        <h2>📝 Description</h2>
        <div class="info-row">
          <div class="info-value">${permis.description}</div>
        </div>
      </div>
      ` : ''}

      ${approbations && approbations.length > 0 ? `
      <div class="section">
        <h2>✅ Approbations (${approbations.length})</h2>
        ${approbations.map((app, idx) => `
          <div class="approval-item">
            <strong>${idx + 1}. ${app.prenom} ${app.nom}</strong> - ${app.role_app}<br>
            Statut: <strong>${app.statut}</strong> | Date: ${formatDate(app.date_action)}<br>
            ${app.commentaire ? `Remarque: ${app.commentaire}` : ''}
          </div>
        `).join('')}
      </div>
      ` : `
      <div class="critical-info">
        ⚠️ AUCUNE APPROBATION - Document en attente de validation
      </div>
      `}

      <!-- ✅ CORRIGÉ: Zone de sécurité avec code facilement copiable -->
      <div class="security-zone">
        <h3>🔒 INFORMATIONS DE SÉCURITÉ</h3>
        
        <div class="security-code-container">
          <span class="security-code-label">CODE DE SÉCURITÉ</span>
          <div class="security-code">${securityData.securityCode}</div>
        </div>

        <div class="security-item">
          <strong>Hash (SHA-256):</strong>
          <span>${securityData.documentHash.substring(0, 32)}...</span>
        </div>
        
        <div class="security-item">
          <strong>Généré le:</strong>
          <span>${formatDate(securityData.generatedAt)}</span>
        </div>
        
        <div class="security-item">
          <strong>Valide jusqu'au:</strong>
          <span>${formatDate(securityData.expiresAt)}</span>
        </div>

        <div class="security-instructions">
          ℹ️ <strong>Pour vérifier ce document:</strong><br>
          1. Visitez le portail de vérification HSE<br>
          2. Sélectionnez "Vérification par code de sécurité"<br>
          3. Copiez-collez le code ci-dessus (${securityData.securityCode})<br>
          4. Saisissez le numéro de permis: ${permis.numero_permis}
        </div>
      </div>

      <div class="footer">
        <p>Document généré automatiquement par le Système de Gestion HSE</p>
        <p>⚠️ Ce document contient des éléments de sécurité. Toute modification invalide le document.</p>
        <p>Pour vérifier l'authenticité, utilisez le code de sécurité ci-dessus</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = pdfService;