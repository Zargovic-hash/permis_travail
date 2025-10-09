const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const permisRepository = require('../repositories/permis.repository');

class PDFService {
  async genererPDFPermis(permisId) {
    const permis = await permisRepository.findById(permisId);
    if (!permis) {
      throw new Error('Permis non trouvé');
    }

    const approbations = await permisRepository.getApprovals(permisId);
    const html = await this.genererHTMLPermis(permis, approbations);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Save PDF
    const pdfDir = path.join(process.env.UPLOAD_DIR || './uploads', 'pdfs');
    await fs.mkdir(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, `permis-${permis.numero_permis}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);

    return { buffer: pdfBuffer, path: pdfPath };
  }

  async genererHTMLPermis(permis, approbations) {
    const template = await fs.readFile(
      path.join(__dirname, '../templates/permis-pdf.html'),
      'utf-8'
    );

    // Format dates
    const formatDate = (date) => {
      return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Build approvals HTML
    const approbationsHTML = approbations.map(app => `
      <tr>
        <td>${app.role_app}</td>
        <td>${app.nom} ${app.prenom}</td>
        <td>${app.statut}</td>
        <td>${formatDate(app.date_action)}</td>
        <td>${app.commentaire || '-'}</td>
        <td style="font-family: monospace; font-size: 10px;">${app.signature_hash?.substring(0, 16)}...</td>
      </tr>
    `).join('');

    // Build conditions HTML
    const conditionsHTML = Object.entries(permis.conditions_prealables || {})
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    const mesuresHTML = Object.entries(permis.mesures_prevention || {})
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    // Replace placeholders
    let html = template
      .replace('{{NUMERO_PERMIS}}', permis.numero_permis)
      .replace('{{TITRE}}', permis.titre)
      .replace('{{DESCRIPTION}}', permis.description || '')
      .replace('{{TYPE_PERMIS}}', permis.type_permis_nom)
      .replace('{{ZONE}}', permis.zone_nom)
      .replace('{{DEMANDEUR}}', `${permis.demandeur_nom} ${permis.demandeur_prenom}`)
      .replace('{{DATE_DEBUT}}', formatDate(permis.date_debut))
      .replace('{{DATE_FIN}}', formatDate(permis.date_fin))
      .replace('{{STATUT}}', permis.statut)
      .replace('{{CONDITIONS}}', conditionsHTML || '<li>Aucune condition spécifiée</li>')
      .replace('{{MESURES}}', mesuresHTML || '<li>Aucune mesure spécifiée</li>')
      .replace('{{APPROBATIONS}}', approbationsHTML)
      .replace('{{DATE_GENERATION}}', formatDate(new Date()));

    return html;
  }

  async verifierIntegritePDF(permisId, pdfBuffer) {
    const approbations = await permisRepository.getApprovals(permisId);
    
    // Verify each signature hash
    const verificationsResults = approbations.map(app => {
      const expectedHash = crypto
        .createHash('sha256')
        .update(`${permisId}${app.utilisateur_id}${app.date_action}${process.env.PDF_SERVER_SECRET}`)
        .digest('hex');
      
      return {
        utilisateur: `${app.nom} ${app.prenom}`,
        role: app.role_app,
        valide: app.signature_hash === expectedHash,
        date: app.date_action
      };
    });

    const toutesSignaturesValides = verificationsResults.every(v => v.valide);

    return {
      valide: toutesSignaturesValides,
      verifications: verificationsResults
    };
  }
}

module.exports = new PDFService();