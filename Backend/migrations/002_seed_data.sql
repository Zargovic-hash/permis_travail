-- ============================================
-- SEED DATA: Données de test pour développement
-- ⚠️ NE PAS UTILISER EN PRODUCTION
-- ============================================

-- Nettoyer les données existantes (en dev uniquement!)
TRUNCATE TABLE 
  audit_logs,
  approbations,
  participants_permis,
  permis,
  refresh_tokens,
  tokens_reset_mdp,
  zones,
  types_permis,
  utilisateurs
CASCADE;

-- ============================================
-- 1. UTILISATEURS
-- Mot de passe: "Password123" pour tous
-- Hash bcrypt: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW
-- ============================================

INSERT INTO utilisateurs (id, nom, prenom, email, mot_de_passe_hash, role, telephone, actif) VALUES
-- Admin
('00000000-0000-0000-0000-000000000001', 'Admin', 'Système', 'admin@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'ADMIN', '+213 555 0001', true),

-- HSE
('00000000-0000-0000-0000-000000000002', 'Benali', 'Karim', 'karim.benali@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'HSE', '+213 555 0002', true),
('00000000-0000-0000-0000-000000000003', 'Hadj', 'Fatima', 'fatima.hadj@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'HSE', '+213 555 0003', true),

-- Responsables de Zone
('00000000-0000-0000-0000-000000000004', 'Meziani', 'Ahmed', 'ahmed.meziani@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'RESP_ZONE', '+213 555 0004', true),
('00000000-0000-0000-0000-000000000005', 'Ladjel', 'Samira', 'samira.ladjel@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'RESP_ZONE', '+213 555 0005', true),

-- Superviseurs
('00000000-0000-0000-0000-000000000006', 'Bouzid', 'Yacine', 'yacine.bouzid@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'SUPERVISEUR', '+213 555 0006', true),
('00000000-0000-0000-0000-000000000007', 'Khelifi', 'Nadia', 'nadia.khelifi@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'SUPERVISEUR', '+213 555 0007', true),

-- Demandeurs
('00000000-0000-0000-0000-000000000008', 'Sahraoui', 'Mohamed', 'mohamed.sahraoui@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'DEMANDEUR', '+213 555 0008', true),
('00000000-0000-0000-0000-000000000009', 'Amrani', 'Leila', 'leila.amrani@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'DEMANDEUR', '+213 555 0009', true),
('00000000-0000-0000-0000-000000000010', 'Bouazza', 'Rachid', 'rachid.bouazza@hse-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVTZz.zEW', 'DEMANDEUR', '+213 555 0010', true);

-- ============================================
-- 2. ZONES
-- ============================================

INSERT INTO zones (id, nom, description, responsable_id) VALUES
('10000000-0000-0000-0000-000000000001', 'Atelier de Production', 'Zone principale de fabrication et assemblage', '00000000-0000-0000-0000-000000000004'),
('10000000-0000-0000-0000-000000000002', 'Entrepôt', 'Zone de stockage des matières premières et produits finis', '00000000-0000-0000-0000-000000000004'),
('10000000-0000-0000-0000-000000000003', 'Zone Chimique', 'Manipulation et stockage de produits chimiques', '00000000-0000-0000-0000-000000000005'),
('10000000-0000-0000-0000-000000000004', 'Chaufferie', 'Installation de chaudières et équipements thermiques', '00000000-0000-0000-0000-000000000005'),
('10000000-0000-0000-0000-000000000005', 'Toiture', 'Travaux en hauteur sur toiture du bâtiment', '00000000-0000-0000-0000-000000000004');

-- ============================================
-- 3. TYPES DE PERMIS
-- ============================================

INSERT INTO types_permis (id, nom, description) VALUES
('20000000-0000-0000-0000-000000000001', 'Permis Feu', 'Travaux par point chaud (soudage, meulage, découpe)'),
('20000000-0000-0000-0000-000000000002', 'Permis Espace Confiné', 'Intervention en espace confiné nécessitant des tests atmosphériques'),
('20000000-0000-0000-0000-000000000003', 'Permis Électrique', 'Travaux sur installations électriques hors tension ou sous tension'),
('20000000-0000-0000-0000-000000000004', 'Permis Travaux en Hauteur', 'Travaux à plus de 3 mètres nécessitant un harnais de sécurité'),
('20000000-0000-0000-0000-000000000005', 'Permis Excavation', 'Travaux de terrassement et excavation'),
('20000000-0000-0000-0000-000000000006', 'Permis LOTO', 'Lock Out Tag Out - Consignation et déconsignation');

-- ============================================
-- 4. PERMIS (Exemples dans différents états)
-- ============================================

-- Permis 1: BROUILLON
INSERT INTO permis (id, numero_permis, type_permis_id, zone_id, demandeur_id, titre, description, statut, date_debut, date_fin, conditions_prealables, mesures_prevention) VALUES
('30000000-0000-0000-0000-000000000001', 
 'PT-2025-00001', 
 '20000000-0000-0000-0000-000000000001', 
 '10000000-0000-0000-0000-000000000001', 
 '00000000-0000-0000-0000-000000000008',
 'Soudure réparation structure métallique', 
 'Réparation par soudure TIG d''une fissure sur poutrelle métallique dans l''atelier de production', 
 'BROUILLON',
 NOW() + INTERVAL '1 day',
 NOW() + INTERVAL '1 day' + INTERVAL '4 hours',
 '{"isolation_zone": "Périmètre de sécurité 5m", "ventilation": "Ventilation forcée active", "equipement": "Extincteurs CO2 à proximité"}',
 '{"epi": "Masque de soudeur, gants isolants, combinaison ignifugée", "surveillance": "Surveillance continue par agent HSE", "detection": "Détecteur de fumée actif"}');

-- Permis 2: EN_ATTENTE
INSERT INTO permis (id, numero_permis, type_permis_id, zone_id, demandeur_id, titre, description, statut, date_debut, date_fin, conditions_prealables, mesures_prevention) VALUES
('30000000-0000-0000-0000-000000000002', 
 'PT-2025-00002', 
 '20000000-0000-0000-0000-000000000002', 
 '10000000-0000-0000-0000-000000000003', 
 '00000000-0000-0000-0000-000000000009',
 'Nettoyage cuve de stockage acide', 
 'Intervention dans cuve de 5m³ pour nettoyage résidus acides et inspection visuelle', 
 'EN_ATTENTE',
 NOW() + INTERVAL '2 days',
 NOW() + INTERVAL '2 days' + INTERVAL '6 hours',
 '{"ventilation": "Aération naturelle 24h avant intervention", "tests_atmos": "Tests O2, LEL, H2S obligatoires", "consignation": "Vannes d''arrivée consignées et verrouillées"}',
 '{"epi": "Appareil respiratoire autonome, combinaison étanche", "surveillance": "Guetteur équipé radio en permanence", "evacuation": "Harnais + treuil de secours"}');

INSERT INTO approbations (id, permis_id, utilisateur_id, role_app, statut, commentaire, signature_hash, date_action) VALUES
('40000000-0000-0000-0000-000000000001', 
 '30000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000008',
 'DEMANDEUR',
 'APPROUVE',
 'Permis soumis pour validation superviseur',
 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
 NOW() - INTERVAL '30 minutes');

-- Permis 3: VALIDE
INSERT INTO permis (id, numero_permis, type_permis_id, zone_id, demandeur_id, titre, description, statut, date_debut, date_fin, conditions_prealables, mesures_prevention, resultat_tests_atmos) VALUES
('30000000-0000-0000-0000-000000000003', 
 'PT-2025-00003', 
 '20000000-0000-0000-0000-000000000003', 
 '10000000-0000-0000-0000-000000000004', 
 '00000000-0000-0000-0000-000000000010',
 'Remplacement disjoncteur principal', 
 'Changement disjoncteur 400A dans tableau électrique général chaufferie', 
 'VALIDE',
 NOW() + INTERVAL '3 days',
 NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
 '{"consignation": "Disjoncteur amont ouvert et verrouillé", "verification": "Absence de tension vérifiée VAT", "signalisation": "Panneau travaux en cours"}',
 '{"epi": "Gants isolants classe 2, chaussures diélectriques, écran facial", "outils": "Outils isolés uniquement", "permis": "Attestation habilitation électrique BR"}',
 '{}');

INSERT INTO approbations (id, permis_id, utilisateur_id, role_app, statut, commentaire, signature_hash, date_action) VALUES
('40000000-0000-0000-0000-000000000002', 
 '30000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000010',
 'DEMANDEUR',
 'APPROUVE',
 'Soumission initiale',
 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
 NOW() - INTERVAL '2 hours'),
('40000000-0000-0000-0000-000000000003', 
 '30000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000006',
 'SUPERVISEUR',
 'APPROUVE',
 'Conditions de sécurité validées, intervention autorisée',
 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
 NOW() - INTERVAL '1 hour');

-- Permis 4: EN_COURS
INSERT INTO permis (id, numero_permis, type_permis_id, zone_id, demandeur_id, titre, description, statut, date_debut, date_fin, conditions_prealables, mesures_prevention) VALUES
('30000000-0000-0000-0000-000000000004', 
 'PT-2025-00004', 
 '20000000-0000-0000-0000-000000000004', 
 '10000000-0000-0000-0000-000000000005', 
 '00000000-0000-0000-0000-000000000008',
 'Installation échafaudage toiture', 
 'Montage échafaudage fixe pour travaux d''étanchéité toiture bâtiment A', 
 'EN_COURS',
 NOW() - INTERVAL '2 hours',
 NOW() + INTERVAL '6 hours',
 '{"zone_interdite": "Périmètre sécurisé au sol 10m", "conditions_meteo": "Vent < 40 km/h, pas de pluie", "verification": "Contrôle sol porteur"}',
 '{"epi": "Harnais antichute, casque, gants", "ligne_vie": "Ligne de vie temporaire installée", "formation": "Certificat travail en hauteur valide"}');

INSERT INTO approbations (id, permis_id, utilisateur_id, role_app, statut, commentaire, signature_hash, date_action) VALUES
('40000000-0000-0000-0000-000000000004', 
 '30000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000008',
 'DEMANDEUR',
 'APPROUVE',
 'Demande initiale',
 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
 NOW() - INTERVAL '1 day'),
('40000000-0000-0000-0000-000000000005', 
 '30000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000007',
 'SUPERVISEUR',
 'APPROUVE',
 'Méthode validée',
 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
 NOW() - INTERVAL '3 hours'),
('40000000-0000-0000-0000-000000000006', 
 '30000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000004',
 'RESP_ZONE',
 'APPROUVE',
 'Zone autorisée, travaux peuvent commencer',
 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
 NOW() - INTERVAL '2 hours');

-- Permis 5: CLOTURE
INSERT INTO permis (id, numero_permis, type_permis_id, zone_id, demandeur_id, titre, description, statut, date_debut, date_fin, conditions_prealables, mesures_prevention) VALUES
('30000000-0000-0000-0000-000000000005', 
 'PT-2025-00005', 
 '20000000-0000-0000-0000-000000000005', 
 '10000000-0000-0000-0000-000000000002', 
 '00000000-0000-0000-0000-000000000009',
 'Excavation tranchée réseau incendie', 
 'Creusement tranchée 1.5m profondeur pour passage canalisations sprinkler', 
 'CLOTURE',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '1 day',
 '{"plans_reseaux": "Plans VRD consultés", "detection": "Détection réseaux enterrés effectuée", "blindage": "Blindage de tranchée obligatoire"}',
 '{"epi": "Casque, gilet haute visibilité, chaussures de sécurité", "acces": "Échelle d''accès tous les 10m", "signalisation": "Balisage lumineux périmètre"}');

INSERT INTO approbations (id, permis_id, utilisateur_id, role_app, statut, commentaire, signature_hash, date_action) VALUES
('40000000-0000-0000-0000-000000000007', 
 '30000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000009',
 'DEMANDEUR',
 'APPROUVE',
 'Workflow complet',
 'g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
 NOW() - INTERVAL '3 days'),
('40000000-0000-0000-0000-000000000008', 
 '30000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000006',
 'SUPERVISEUR',
 'APPROUVE',
 'Validé',
 'h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3',
 NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
('40000000-0000-0000-0000-000000000009', 
 '30000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000005',
 'RESP_ZONE',
 'APPROUVE',
 'Autorisé',
 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4',
 NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
('40000000-0000-0000-0000-000000000010', 
 '30000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000009',
 'DEMANDEUR',
 'APPROUVE',
 'Travaux terminés, zone nettoyée et restituée',
 'j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5',
 NOW() - INTERVAL '1 day' + INTERVAL '1 hour');

-- ============================================
-- 5. AUDIT LOGS (quelques exemples)
-- ============================================

INSERT INTO audit_logs (action, utilisateur_id, cible_table, cible_id, payload, ip_client, date_action) VALUES
('INSCRIPTION', '00000000-0000-0000-0000-000000000008', 'utilisateurs', '00000000-0000-0000-0000-000000000008', '{"role": "DEMANDEUR"}', '192.168.1.100', NOW() - INTERVAL '30 days'),
('CONNEXION', '00000000-0000-0000-0000-000000000008', 'utilisateurs', '00000000-0000-0000-0000-000000000008', '{}', '192.168.1.100', NOW() - INTERVAL '1 hour'),
('CREATION_PERMIS', '00000000-0000-0000-0000-000000000008', 'permis', '30000000-0000-0000-0000-000000000001', '{"numero_permis": "PT-2025-00001", "statut": "BROUILLON"}', '192.168.1.100', NOW() - INTERVAL '30 minutes'),
('VALIDATION_PERMIS', '00000000-0000-0000-0000-000000000006', 'permis', '30000000-0000-0000-0000-000000000003', '{"role": "SUPERVISEUR", "ancien_statut": "EN_ATTENTE", "nouveau_statut": "VALIDE"}', '192.168.1.105', NOW() - INTERVAL '1 hour'),
('CLOTURE_PERMIS', '00000000-0000-0000-0000-000000000009', 'permis', '30000000-0000-0000-0000-000000000005', '{"ancien_statut": "EN_COURS"}', '192.168.1.102', NOW() - INTERVAL '1 day');

-- ============================================
-- FIN DU SEED
-- ============================================

-- Afficher un résumé
SELECT 
  'Seed completed successfully!' AS status,
  (SELECT COUNT(*) FROM utilisateurs) AS utilisateurs,
  (SELECT COUNT(*) FROM zones) AS zones,
  (SELECT COUNT(*) FROM types_permis) AS types_permis,
  (SELECT COUNT(*) FROM permis) AS permis,
  (SELECT COUNT(*) FROM approbations) AS approbations,
  (SELECT COUNT(*) FROM audit_logs) AS audit_logs;