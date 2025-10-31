// ========== BACKEND: Routes de Vérification (CORRIGÉES SANS MODIFIER LE REPO) ==========

const express = require('express');
const router = express.Router();
const permisRepository = require('../repositories/permis.repository');
const crypto = require('crypto');
const pool = require('../config/database'); // ✅ Import direct de la DB

/**
 * ✅ Fonction helper: Recherche EXACTE par numéro de permis
 */
async function findPermisByNumeroExact(numeroPermis) {
  console.log('🔍 Recherche EXACTE du permis:', numeroPermis);
  
  const result = await pool.query(
    `SELECT p.*, 
            tp.nom as type_permis_nom,
            z.nom as zone_nom,
            u.nom as demandeur_nom,
            u.prenom as demandeur_prenom
     FROM permis p
     LEFT JOIN types_permis tp ON p.type_permis_id = tp.id
     LEFT JOIN zones z ON p.zone_id = z.id
     LEFT JOIN utilisateurs u ON p.demandeur_id = u.id
     WHERE p.numero_permis = $1 AND p.supprime = false
     LIMIT 1`,
    [numeroPermis]
  );
  
  console.log(`📊 Résultat: ${result.rows.length > 0 ? result.rows[0].numero_permis : 'Aucun'}`);
  
  return result.rows[0] || null;
}

/**
 * ✅ 1. Vérifier par Code de Sécurité
 * POST /api/verify/security-code
 */
router.post('/security-code', async (req, res, next) => {
  try {
    const { securityCode, numeroPermis } = req.body;

    if (!securityCode || !numeroPermis) {
      return res.status(400).json({
        success: false,
        message: 'Code de sécurité et numéro de permis requis'
      });
    }

    console.log('🔍 Vérification par code de sécurité:', { 
      securityCode, 
      numeroPermis 
    });

    // ✅ CORRIGÉ: Recherche EXACTE avec la fonction helper
    const permis = await findPermisByNumeroExact(numeroPermis);

    if (!permis) {
      console.log('❌ Permis non trouvé:', numeroPermis);
      return res.status(404).json({
        success: false,
        message: 'Permis non trouvé',
        isValid: false
      });
    }

    console.log('✅ Permis trouvé:', permis.numero_permis);

    // Recalculer le code de sécurité pour vérifier
    const securityPayload = JSON.stringify({
      numero: permis.numero_permis,
      titre: permis.titre,
      zone: permis.zone_id,
      debut: permis.date_debut,
      fin: permis.date_fin,
      statut: permis.statut,
      timestamp: new Date(permis.date_creation).toISOString()
    });

    const calculatedCode = crypto
      .createHash('sha1')
      .update(securityPayload + (process.env.PDF_SERVER_SECRET || 'secure-secret'))
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();

    console.log('🔐 Vérification code:');
    console.log('   Code fourni:', securityCode);
    console.log('   Code calculé:', calculatedCode);

    const isCodeValid = securityCode === calculatedCode;

    return res.json({
      success: true,
      isValid: isCodeValid,
      message: isCodeValid ? '✅ Code valide - Permis authentique' : '❌ Code invalide',
      permis: {
        numero: permis.numero_permis,
        titre: permis.titre,
        zone: permis.zone_nom,
        statut: permis.statut,
        dateDebut: permis.date_debut,
        dateFin: permis.date_fin,
        demandeur: `${permis.demandeur_prenom} ${permis.demandeur_nom}`
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
});

/**
 * ✅ 2. Vérifier par Numéro de Permis
 * GET /api/verify/permis/:numeroPermis
 */
router.get('/permis/:numeroPermis', async (req, res, next) => {
  try {
    const { numeroPermis } = req.params;

    console.log('🔍 Recherche permis:', numeroPermis);

    // ✅ CORRIGÉ: Recherche EXACTE avec la fonction helper
    const permis = await findPermisByNumeroExact(numeroPermis);

    if (!permis) {
      console.log('❌ Permis non trouvé:', numeroPermis);
      return res.status(404).json({
        success: false,
        message: 'Permis non trouvé',
        isValid: false
      });
    }

    console.log('✅ Permis trouvé:', permis.numero_permis);

    const approbations = await permisRepository.getApprovals(permis.id);

    // Vérifier l'expiration
    const dateFin = new Date(permis.date_fin);
    const aujourdhui = new Date();
    const estExpire = aujourdhui > dateFin;

    // ✅ Vérifier si au moins une approbation est APPROUVE
    const hasApproval = approbations.some(a => a.statut === 'APPROUVE');
    
    // ✅ Condition de validité plus souple
    const isValid = !estExpire && 
                    (permis.statut === 'EN_COURS' || permis.statut === 'VALIDE' || permis.statut === 'APPROUVE') &&
                    hasApproval;

    console.log('📋 Validation:', {
      estExpire,
      statut: permis.statut,
      hasApproval,
      isValid
    });

    return res.json({
      success: true,
      isValid: isValid,
      permis: {
        numero: permis.numero_permis,
        titre: permis.titre,
        zone: permis.zone_nom,
        type: permis.type_permis_nom,
        statut: permis.statut,
        dateDebut: permis.date_debut,
        dateFin: permis.date_fin,
        estExpire: estExpire,
        demandeur: `${permis.demandeur_prenom} ${permis.demandeur_nom}`,
        description: permis.description,
        approbations: approbations.length,
        approbationsDetail: approbations.map(a => ({
          nom: `${a.prenom} ${a.nom}`,
          role: a.role_app,
          statut: a.statut,
          date: a.date_action
        }))
      },
      message: !isValid 
        ? (estExpire ? '❌ Permis expiré' : !hasApproval ? '❌ Aucune approbation valide' : '❌ Statut invalide')
        : '✅ Permis valide'
    });

  } catch (error) {
    console.error('❌ Erreur recherche:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
});

/**
 * ✅ 3. Vérifier l'Intégrité (depuis PDF scanné)
 * POST /api/verify/integrity
 */
router.post('/integrity', async (req, res, next) => {
  try {
    const { numeroPermis, codeSecurite, hashDocument } = req.body;

    console.log('🔍 Vérification intégrité:', { numeroPermis, codeSecurite, hashDocument });

    // ✅ CORRIGÉ: Recherche EXACTE avec la fonction helper
    const permis = await findPermisByNumeroExact(numeroPermis);

    if (!permis) {
      console.log('❌ Permis non trouvé:', numeroPermis);
      return res.json({
        success: false,
        isValid: false,
        message: 'Permis non trouvé',
        details: []
      });
    }

    console.log('✅ Permis trouvé:', permis.numero_permis);

    const approbations = await permisRepository.getApprovals(permis.id);
    const details = [];

    // 1️⃣ Vérifier le numéro
    const numeroValide = permis.numero_permis === numeroPermis;
    details.push({
      check: 'Numéro de permis',
      valide: numeroValide,
      message: numeroValide ? '✅ Numéro valide' : '❌ Numéro invalide'
    });

    // 2️⃣ Vérifier le code de sécurité
    const securityPayload = JSON.stringify({
      numero: permis.numero_permis,
      titre: permis.titre,
      zone: permis.zone_id,
      debut: permis.date_debut,
      fin: permis.date_fin,
      statut: permis.statut,
      timestamp: new Date(permis.date_creation).toISOString()
    });

    const calculatedCode = crypto
      .createHash('sha1')
      .update(securityPayload + (process.env.PDF_SERVER_SECRET || 'secure-secret'))
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();

    const codeValide = codeSecurite === calculatedCode;
    details.push({
      check: 'Code de sécurité',
      valide: codeValide,
      message: codeValide ? '✅ Code valide' : '❌ Code invalide ou modifié'
    });

    // 3️⃣ Vérifier l'expiration
    const dateFin = new Date(permis.date_fin);
    const aujourdhui = new Date();
    const paExpire = aujourdhui <= dateFin;
    details.push({
      check: 'Validité temporelle',
      valide: paExpire,
      message: paExpire ? '✅ Permis non expiré' : '❌ Permis expiré'
    });

    // 4️⃣ Vérifier le statut
    const statutValide = permis.statut === 'EN_COURS' || permis.statut === 'VALIDE';
    details.push({
      check: 'Statut du permis',
      valide: statutValide,
      message: statutValide ? `✅ Statut valide (${permis.statut})` : `❌ Statut invalide (${permis.statut})`
    });

    // 5️⃣ Vérifier les approbations
    const approbationsValides = approbations.filter(a => a.statut === 'APPROUVE').length > 0;
    details.push({
      check: 'Approbations',
      valide: approbationsValides,
      message: approbationsValides ? `✅ ${approbations.length} approbation(s) valide(s)` : '❌ Pas d\'approbation'
    });

    // Résultat global
    const toutValide = details.every(d => d.valide);

    return res.json({
      success: true,
      isValid: toutValide,
      overallMessage: toutValide ? '✅ DOCUMENT AUTHENTIQUE' : '❌ DOCUMENT SUSPECT',
      score: `${details.filter(d => d.valide).length}/${details.length}`,
      details: details,
      permis: {
        numero: permis.numero_permis,
        titre: permis.titre,
        zone: permis.zone_nom,
        statut: permis.statut
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification intégrité:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
});

/**
 * ✅ 4. Obtenir des Informations Publiques sur un Permis
 * GET /api/verify/public/:numeroPermis
 */
router.get('/public/:numeroPermis', async (req, res, next) => {
  try {
    const { numeroPermis } = req.params;

    console.log('🔍 Recherche publique:', numeroPermis);

    // ✅ CORRIGÉ: Recherche EXACTE avec la fonction helper
    const permis = await findPermisByNumeroExact(numeroPermis);

    if (!permis) {
      console.log('❌ Permis non trouvé:', numeroPermis);
      return res.status(404).json({
        success: false,
        message: 'Permis non trouvé'
      });
    }

    console.log('✅ Permis trouvé:', permis.numero_permis);

    // Retourner seulement les infos publiques
    return res.json({
      success: true,
      permis: {
        numero: permis.numero_permis,
        titre: permis.titre,
        zone: permis.zone_nom,
        type: permis.type_permis_nom,
        statut: permis.statut,
        dateDebut: permis.date_debut,
        dateFin: permis.date_fin,
        estActif: permis.statut === 'EN_COURS',
        estExpire: new Date() > new Date(permis.date_fin)
      }
    });

  } catch (error) {
    console.error('❌ Erreur recherche publique:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
});

module.exports = router;