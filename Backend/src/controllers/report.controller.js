const pool = require('../config/database');
const permisRepository = require('../repositories/permis.repository');

class ReportController {
  async statistiques(req, res, next) {
    try {
      // Global statistics
      const statsGlobales = await pool.query(`
        SELECT 
          COUNT(*) as total_permis,
          COUNT(*) FILTER (WHERE statut = 'EN_COURS') as permis_actifs,
          COUNT(*) FILTER (WHERE statut = 'VALIDE') as permis_valides,
          COUNT(*) FILTER (WHERE statut = 'SUSPENDU') as permis_suspendus,
          COUNT(*) FILTER (WHERE statut = 'CLOTURE') as permis_clotures,
          COUNT(*) FILTER (WHERE statut = 'BROUILLON') as permis_brouillons,
          COUNT(*) FILTER (WHERE statut = 'EN_ATTENTE') as permis_en_attente
        FROM permis
        WHERE supprime = false
      `);

      // By zone
      const parZone = await pool.query(`
        SELECT 
          z.nom as zone,
          z.id as zone_id,
          COUNT(p.id) as nombre_permis,
          COUNT(p.id) FILTER (WHERE p.statut = 'EN_COURS') as actifs,
          COUNT(p.id) FILTER (WHERE p.statut = 'CLOTURE') as clotures
        FROM zones z
        LEFT JOIN permis p ON z.id = p.zone_id AND p.supprime = false
        GROUP BY z.id, z.nom
        ORDER BY nombre_permis DESC
      `);

      // By type
      const parType = await pool.query(`
        SELECT 
          tp.nom as type,
          tp.id as type_id,
          COUNT(p.id) as nombre_permis,
          COUNT(p.id) FILTER (WHERE p.statut = 'EN_COURS') as actifs,
          COUNT(p.id) FILTER (WHERE p.statut = 'CLOTURE') as clotures
        FROM types_permis tp
        LEFT JOIN permis p ON tp.id = p.type_permis_id AND p.supprime = false
        GROUP BY tp.id, tp.nom
        ORDER BY nombre_permis DESC
      `);

      // By month (last 12 months)
      const parMois = await pool.query(`
        SELECT 
          TO_CHAR(date_creation, 'YYYY-MM') as mois,
          COUNT(*) as nombre_permis
        FROM permis
        WHERE supprime = false 
          AND date_creation >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(date_creation, 'YYYY-MM')
        ORDER BY mois DESC
      `);

      // Average approval time
      const tempsApprobation = await pool.query(`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (date_modification - date_creation))/3600) as heures_moyenne
        FROM permis
        WHERE statut IN ('VALIDE', 'EN_COURS', 'CLOTURE')
          AND supprime = false
      `);

      res.json({
        success: true,
        data: {
          statistiques_globales: statsGlobales.rows[0],
          par_zone: parZone.rows,
          par_type: parType.rows,
          par_mois: parMois.rows,
          temps_approbation_moyen: parseFloat(tempsApprobation.rows[0]?.heures_moyenne || 0).toFixed(2)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const { zone_id, type_permis_id, statut, date_debut, date_fin } = req.query;
      const filters = { zone_id, type_permis_id, statut, date_debut, date_fin };
      
      const { data } = await permisRepository.findAll(filters, { page: 1, limit: 10000 });

      // Generate CSV
      const headers = [
        'Numéro', 'Titre', 'Type', 'Zone', 'Demandeur', 
        'Statut', 'Date Début', 'Date Fin', 'Date Création'
      ];
      
      const rows = data.map(p => [
        p.numero_permis,
        p.titre,
        p.type_permis_nom,
        p.zone_nom,
        `${p.demandeur_prenom} ${p.demandeur_nom}`,
        p.statut,
        new Date(p.date_debut).toLocaleDateString('fr-FR'),
        new Date(p.date_fin).toLocaleDateString('fr-FR'),
        new Date(p.date_creation).toLocaleDateString('fr-FR')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=permis-export.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
