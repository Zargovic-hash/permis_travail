const express = require('express');
const router = express.Router();
const permisController = require('../controllers/permis.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');
const { createPermisSchema, updatePermisSchema, validerPermisSchema } = require('../validators/permis.validator');

// ✅ IMPORTS POUR LES ROUTES TEST ET DEBUG
const permisRepository = require('../repositories/permis.repository');
const pdfService = require('../services/pdf.service');

// ========== IMPORTANT: Authentification pour toutes les routes sauf DEBUG ==========
router.use(authenticateToken);

// ========== 🧪 ROUTES DEBUG (SANS AUTHENTIFICATION) ==========
// ⚠️ CES ROUTES VIENNENT EN PREMIER CAR ELLES RÉPONDENT AVANT router.use(authenticateToken)

// 🧪 ROUTE DIAGNOSTIC SIMPLE - Tester Puppeteer directement
router.get('/:id/export/pdf/debug', 
  async (req, res, next) => {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🧪 DEBUG: Test Puppeteer Simple');
      console.log('═══════════════════════════════════════════════════════');

      const puppeteer = require('puppeteer');
      const crypto = require('crypto');

      console.log('✅ Step 1: Puppeteer importé');

      // Test simple
      console.log('⏳ Step 2: Lancement du navigateur...');
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        });
        console.log('✅ Navigateur lancé');
      } catch (launchError) {
        console.error('❌ Erreur lancement navigateur:', launchError.message);
        return res.status(500).json({
          success: false,
          error: 'Impossible de lancer Puppeteer',
          message: launchError.message,
          hint: 'Vérifier que Puppeteer est installé: npm list puppeteer'
        });
      }

      console.log('⏳ Step 3: Création de page...');
      const page = await browser.newPage();
      console.log('✅ Page créée');

      console.log('⏳ Step 4: Génération HTML simple...');
      const htmlSimple = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test PDF</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #2563eb; }
          </style>
        </head>
        <body>
          <h1>✅ Test PDF Réussi!</h1>
          <p>Ceci est un test simple de génération PDF</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Test basique pour vérifier que Puppeteer fonctionne</p>
        </body>
        </html>
      `;
      console.log('✅ HTML généré:', htmlSimple.length, 'caractères');

      console.log('⏳ Step 5: Chargement du contenu...');
      try {
        await page.setContent(htmlSimple, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        console.log('✅ Contenu chargé');
      } catch (contentError) {
        console.error('❌ Erreur chargement contenu:', contentError.message);
        await browser.close();
        return res.status(500).json({
          success: false,
          error: 'Impossible de charger le contenu HTML',
          message: contentError.message
        });
      }

      // Attendre 500ms
      console.log('⏳ Step 6: Attente 500ms...');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Attente terminée');

      console.log('⏳ Step 7: Génération du PDF...');
      let buffer;
      try {
        buffer = await page.pdf({
          format: 'A4',
          margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
          printBackground: true,
          displayHeaderFooter: false
        });
        console.log('✅ PDF généré:', buffer.length, 'bytes');
      } catch (pdfError) {
        console.error('❌ Erreur génération PDF:', pdfError.message);
        await page.close();
        await browser.close();
        return res.status(500).json({
          success: false,
          error: 'Impossible de générer le PDF',
          message: pdfError.message
        });
      }

      console.log('⏳ Step 8: Vérification du buffer...');
      if (!buffer || buffer.length === 0) {
        await page.close();
        await browser.close();
        console.error('❌ Buffer vide');
        return res.status(500).json({
          success: false,
          error: 'Buffer PDF vide'
        });
      }

      const signature = buffer.toString('ascii', 0, 4);
      console.log('   Signature:', signature);
      if (signature !== '%PDF') {
        await page.close();
        await browser.close();
        console.error('❌ Signature invalide:', signature);
        return res.status(500).json({
          success: false,
          error: 'PDF invalide - signature manquante',
          signature: signature,
          firstBytes: buffer.slice(0, 20).toString('hex')
        });
      }

      console.log('✅ Signature valide: %PDF');

      console.log('⏳ Step 9: Fermeture...');
      await page.close();
      await browser.close();
      console.log('✅ Navigateur fermé');

      const hash = crypto.createHash('sha256').update(buffer).digest('hex');

      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ TEST RÉUSSI!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');

      // Envoyer le PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="test-debug.pdf"');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('X-PDF-Hash', hash);
      res.status(200).send(buffer);

    } catch (error) {
      console.error('');
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ ERREUR CRITIQUE:', error.message);
      console.error('═══════════════════════════════════════════════════════');
      console.error('Stack:', error.stack);
      console.error('');

      res.status(500).json({
        success: false,
        error: 'Erreur critique',
        message: error.message,
        stack: error.stack
      });
    }
  }
);

// 🧪 ROUTE POUR VÉRIFIER LES LOGS COMPLETS
router.get('/:id/export/pdf/logs', 
  async (req, res, next) => {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📊 ROUTE: Vérification des logs');
      console.log('═══════════════════════════════════════════════════════');

      const permisId = req.params.id;

      console.log('Step 1: Récupération du permis...');
      const permis = await permisRepository.findById(permisId);
      
      if (!permis) {
        console.log('❌ Permis non trouvé');
        return res.json({
          success: false,
          error: 'Permis non trouvé'
        });
      }

      console.log('✅ Permis trouvé:', permis.numero_permis);
      console.log('');
      console.log('Step 2: Tentative de génération du PDF...');
      console.log('Cela va afficher les logs détaillés du service PDF');
      console.log('');

      // Essayer la génération
      try {
        const result = await pdfService.genererPDFPermis(permisId);
        console.log('✅ PDF généré avec succès');
        
        res.json({
          success: true,
          message: 'PDF généré avec succès - Vérifier les logs du serveur',
          data: {
            bufferSize: result.size,
            hash: result.hash.substring(0, 32) + '...'
          }
        });
      } catch (pdfError) {
        console.log('❌ Erreur lors de la génération');
        console.error('Message:', pdfError.message);
        console.error('Stack:', pdfError.stack);

        res.json({
          success: false,
          error: 'Erreur génération PDF',
          message: pdfError.message,
          hint: 'Les logs détaillés sont dans la console du serveur ci-dessus'
        });
      }

    } catch (error) {
      console.error('Erreur:', error.message);
      res.json({
        success: false,
        error: error.message
      });
    }
  }
);

// ========== ROUTES TEST (AVEC AUTHENTIFICATION) ==========

// 🧪 ROUTE DE TEST - Dépannage complet
router.get('/:id/export/pdf/test', 
  async (req, res, next) => {
    try {
      console.log('');
      console.log('┌─────────────────────────────────────────────────────┐');
      console.log('│   🧪 ROUTE TEST: Export PDF                         │');
      console.log('└─────────────────────────────────────────────────────┘');
      
      const permisId = req.params.id;
      console.log('Permis ID:', permisId);

      // ✅ ÉTAPE 1: Vérifier que le permis existe
      console.log('\n📋 Étape 1: Récupération du permis...');
      const permis = await permisRepository.findById(permisId);
      
      if (!permis) {
        console.error('❌ Permis non trouvé');
        return res.status(404).json({
          success: false,
          error: 'Permis non trouvé',
          permisId
        });
      }
      
      console.log('✅ Permis trouvé:', {
        numero: permis.numero_permis,
        titre: permis.titre,
        statut: permis.statut
      });

      // ✅ ÉTAPE 2: Essayer de générer le PDF
      console.log('\n📝 Étape 2: Génération du PDF...');
      let pdfData;
      try {
        pdfData = await pdfService.genererPDFPermis(permisId);
        console.log('✅ PDF généré avec succès');
        console.log('   - Taille du buffer:', pdfData.size, 'bytes');
        console.log('   - Hash:', pdfData.hash.substring(0, 16) + '...');
      } catch (pdfError) {
        console.error('❌ Erreur génération PDF:', pdfError.message);
        return res.status(500).json({
          success: false,
          error: 'Erreur génération PDF',
          details: pdfError.message,
          stack: pdfError.stack
        });
      }

      // ✅ ÉTAPE 3: Vérifier le buffer
      console.log('\n🔍 Étape 3: Vérification du buffer...');
      if (!pdfData.buffer || pdfData.buffer.length === 0) {
        console.error('❌ Buffer vide');
        return res.status(500).json({
          success: false,
          error: 'Buffer PDF vide',
          bufferSize: pdfData.buffer ? pdfData.buffer.length : 0
        });
      }

      // Vérifier la signature PDF
      const pdfSignature = pdfData.buffer.toString('ascii', 0, 4);
      console.log('   - Signature PDF:', pdfSignature);
      
      if (pdfSignature !== '%PDF') {
        console.error('❌ Signature PDF manquante');
        console.error('   - Premiers bytes:', pdfData.buffer.slice(0, 20));
        return res.status(500).json({
          success: false,
          error: 'PDF invalide - signature manquante',
          signature: pdfSignature,
          firstBytes: pdfData.buffer.slice(0, 20).toString('hex')
        });
      }

      console.log('✅ Buffer valide');

      // ✅ ÉTAPE 4: Envoyer le PDF
      console.log('\n📤 Étape 4: Envoi du PDF...');
      
      const filename = `Permis-${permis.numero_permis}-TEST.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfData.buffer.length);
      res.setHeader('X-PDF-Hash', pdfData.hash);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      console.log('Headers définis');
      console.log('   - Content-Type: application/pdf');
      console.log('   - Content-Length:', pdfData.buffer.length);
      console.log('   - Filename:', filename);

      res.status(200).send(pdfData.buffer);
      
      console.log('✅ PDF envoyé avec succès');
      console.log('');

    } catch (error) {
      console.error('');
      console.error('❌ ERREUR ROUTE TEST:', error.message);
      console.error('Stack:', error.stack);
      console.error('');

      res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        message: error.message,
        stack: error.stack
      });
    }
  }
);

// 🧪 ROUTE DIAGNOSTIQUE
router.get('/:id/export/pdf/diag', 
  async (req, res, next) => {
    try {
      const permisId = req.params.id;
      
      // Récupérer toutes les infos
      const permis = await permisRepository.findById(permisId);
      const approbations = permis ? await permisRepository.getApprovals(permisId) : [];

      res.json({
        success: true,
        diagnostics: {
          permis: permis ? {
            id: permis.id,
            numero: permis.numero_permis,
            titre: permis.titre,
            statut: permis.statut,
            zone: permis.zone_nom,
            date_debut: permis.date_debut,
            date_fin: permis.date_fin,
            has_description: !!permis.description
          } : null,
          approbations: approbations.map(app => ({
            id: app.id,
            nom: app.prenom + ' ' + app.nom,
            role: app.role_app,
            statut: app.statut,
            has_signature: !!app.signature_image_path,
            has_hash: !!app.signature_hash,
            date: app.date_action
          })),
          system_info: {
            nodeVersion: process.version,
            platform: process.platform,
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            uptime: Math.round(process.uptime()) + 's'
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  }
);

// ========== ROUTES PRINCIPALES (EXISTANTES) ==========
// CREATE - Créer un nouveau permis
router.post('/', validate(createPermisSchema), permisController.creer);

// LIST - Lister tous les permis avec filtres
router.get('/', permisController.liste);

// ========== ACTIONS SPÉCIFIQUES (AVANT /:id) ==========

// âœ… VALIDER - Valider/Approuver/Faire progresser un permis
router.post('/:id/valider', 
  requireRole('SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN', 'DEMANDEUR'),
  validate(validerPermisSchema), 
  permisController.valider
);

// SUSPENDRE - Suspendre un permis
router.post('/:id/suspendre', 
  requireRole('HSE', 'RESP_ZONE', 'ADMIN'), 
  permisController.suspendre
);

// REACTIVER - Réactiver un permis suspendu
router.post('/:id/reactiver', 
  requireRole('HSE', 'ADMIN'), 
  permisController.reactiver
);

// CLOTURER - Clôturer un permis
router.post('/:id/cloturer', 
  requireRole('HSE', 'SUPERVISEUR', 'ADMIN', 'DEMANDEUR'),
  permisController.cloturer
);

// FICHIER - Ajouter un fichier justificatif
router.post('/:id/ajouter-fichier', 
  upload.single('fichier'), 
  permisController.ajouterFichier
);

// EXPORT PDF - Exporter en PDF (PRODUCTION)
router.get('/:id/export/pdf', 
  permisController.exportPDF
);

// VERIFY PDF - Vérifier l'intégrité du PDF
router.post('/:id/verify-pdf', 
  permisController.verifierPDF
);

// ACTIONS - Obtenir les actions disponibles
router.get('/:id/actions', 
  permisController.getAvailableActions
);

// ========== ROUTES GÉNÉRIQUES (APRÈS les spécifiques) ==========

// GET BY ID - Obtenir les détails d'un permis
router.get('/:id', 
  permisController.obtenir
);

// UPDATE - Modifier un permis
router.put('/:id', 
  validate(updatePermisSchema), 
  permisController.modifier
);

// DELETE - Supprimer un permis (soft delete)
router.delete('/:id', 
  requireRole('HSE', 'ADMIN'), 
  permisController.supprimer
);

module.exports = router;