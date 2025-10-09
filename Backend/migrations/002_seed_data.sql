/*
-- Seed data pour environnement de développement/test
-- Ce script insère des utilisateurs de test et des données de référence

-- Mot de passe pour tous les utilisateurs de test : "Password123!"
-- Hash bcrypt (12 rounds) : $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILHQ8vq5u

-- Insertion des utilisateurs
INSERT INTO utilisateurs (id, nom, prenom, email, mot_de_passe_hash, role, actif) VALUES
('11111111-1111-1111-1111-111111111111', 'Martin', 'Sophie', 'hse@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILHQ8vq5u', 'HSE', true),
('22222222-2222-2222-2222-222222222222', 'Dubois', 'Jean', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILHQ8vq5u', 'ADMIN', true),
('33333333-3333-3333-3333-333333333333', 'Bernard', 'Pierre', 'resp.zone@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILHQ8vq5u', 'RESP_ZONE', true),
('44444444-4444-4444-4444-444444444444', 'Laurent', 'Marie', 'superviseur@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILHQ8vq5u', 'SUPERVISEUR', true),
('55555555-5555-5555-5555-555555555555', 'Petit', 'Lucas', 'demandeur1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILHQ8vq5u', 'DEMANDEUR', true),
('66666666-6666-6666-6666-666666666666', 'Moreau', 'Emma', 'demandeur2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILHQ8vq5u', 'DEMANDEUR', true);

-- Insertion des zones
INSERT INTO zones (id, nom, description, responsable_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Zone de Production A', 'Zone principale de fabrication - Atelier 1', '33333333-3333-3333-3333-333333333333'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Zone de Maintenance', 'Zone technique et entretien des équipements', '33333333-3333-3333-3333-333333333333'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Zone de Stockage', 'Entrepôt et zone de stockage des produits', '33333333-3333-3333-3333-333333333333'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Zone Extérieure', 'Espaces extérieurs et chantiers temporaires', '33333333-3333-3333-3333-333333333333');

-- Insertion des types de permis
INSERT INTO types_permis (id, nom, description) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Permis Feu', 'Autorisation pour travaux par points chauds (soudage, meulage, etc.)'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Permis Espace Confiné', 'Autorisation pour intervention en espace confiné ou clos'),
('10101010-1010-1010-1010-101010101010', 'Permis Électrique', 'Autorisation pour travaux sur installations électriques'),
('20202020-2020-2020-2020-202020202020', 'Permis Travaux en Hauteur', 'Autorisation pour travaux en hauteur (> 3m)'),
('30303030-3030-3030-3030-303030303030', 'Permis Excavation', 'Autorisation pour travaux de fouille et excavation');

-- Insertion de permis d'exemple
INSERT INTO permis (
  id, numero_permis, type_permis_id, zone_id, titre, description,
  date_debut, date_fin, demandeur_id, statut,
  conditions_prealables, mesures_prevention, resultat_tests_atmos
) VALUES
(
  '70707070-7070-7070-7070-707070707070',
  'PT-2025-00001',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Soudure de réparation sur structure métallique',
  'Intervention de soudure pour réparer une structure métallique endommagée dans l''atelier principal',
  '2025-10-15 08:00:00',
  '2025-10-15 17:00:00',
  '55555555-5555-5555-5555-555555555555',
  'VALIDE',
  '{"isolation_zone": "Zone isolée et balisée", "materiel_secours": "Extincteurs à proximité", "ventilation": "Ventilation naturelle suffisante"}',
  '{"epi": "Port de masque de soudure, gants et tablier ignifugé", "surveillance": "Surveillance permanente par agent de sécurité", "verification": "Vérification absence de matières inflammables"}',
  '{"o2": "20.8%", "lel": "0%", "co": "5 ppm", "h2s": "0 ppm"}'
),
(
  '80808080-8080-8080-8080-808080808080',
  'PT-2025-00002',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Inspection de cuve de stockage',
  'Inspection visuelle et maintenance préventive de la cuve de stockage n°5',
  '2025-10-16 09:00:00',
  '2025-10-16 16:00:00',
  '66666666-6666-6666-6666-666666666666',
  'EN_ATTENTE',
  '{"ventilation": "Ventilation mécanique 30min avant entrée", "tests_atmos": "Tests atmosphériques toutes les heures", "isolation": "Cuve isolée et consignée"}',
  '{"epi": "ARI (Appareil Respiratoire Isolant), harnais", "surveillance": "Surveillant externe en permanence", "communication": "Radio permanente avec surveillant"}',
  '{}'
);

-- Insertion d'approbations pour le premier permis
INSERT INTO approbations (
  id, permis_id, utilisateur_id, role_app, statut, commentaire, date_action, signature_hash
) VALUES
(
  '90909090-9090-9090-9090-909090909090',
  '70707070-7070-7070-7070-707070707070',
  '44444444-4444-4444-4444-444444444444',
  'SUPERVISEUR',
  'APPROUVE',
  'Conditions de sécurité vérifiées et conformes',
  '2025-10-14 14:30:00',
  'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
),
(
  'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
  '70707070-7070-7070-7070-707070707070',
  '33333333-3333-3333-3333-333333333333',
  'RESP_ZONE',
  'APPROUVE',
  'Zone préparée, autorisation accordée',
  '2025-10-14 15:00:00',
  'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567'
),
(
  'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
  '70707070-7070-7070-7070-707070707070',
  '11111111-1111-1111-1111-111111111111',
  'HSE',
  'APPROUVE',
  'Validation finale HSE - Permis accordé',
  '2025-10-14 16:00:00',
  'c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678'
);

-- Log initial de création du système
INSERT INTO audit_logs (action, utilisateur_id, cible_table, payload, ip_client) VALUES
('INITIALISATION_SYSTEME', NULL, 'system', '{"version": "1.0.0", "seed_date": "2025-10-08"}', '127.0.0.1');

COMMIT;
*/