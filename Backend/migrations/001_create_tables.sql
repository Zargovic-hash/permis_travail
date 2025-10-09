-- Création de l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table utilisateurs
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN')),
  habilitations JSONB,
  signature_image_path VARCHAR(500),
  actif BOOLEAN DEFAULT TRUE,
  supprime BOOLEAN DEFAULT FALSE,
  anonymise BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_role ON utilisateurs(role);

-- Table zones
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  responsable_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL
);

CREATE INDEX idx_zones_responsable ON zones(responsable_id);

-- Table types_permis
CREATE TABLE types_permis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(200) NOT NULL,
  description TEXT
);

-- Table permis
CREATE TABLE permis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_permis VARCHAR(50) UNIQUE NOT NULL,
  type_permis_id UUID REFERENCES types_permis(id) ON DELETE RESTRICT,
  zone_id UUID REFERENCES zones(id) ON DELETE RESTRICT,
  titre VARCHAR(200) NOT NULL,
  description TEXT,
  date_debut TIMESTAMP NOT NULL,
  date_fin TIMESTAMP NOT NULL,
  demandeur_id UUID REFERENCES utilisateurs(id) ON DELETE RESTRICT,
  statut VARCHAR(20) DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'EN_ATTENTE', 'VALIDE', 'EN_COURS', 'SUSPENDU', 'CLOTURE')),
  conditions_prealables JSONB,
  mesures_prevention JSONB,
  resultat_tests_atmos JSONB,
  justificatifs JSONB,
  supprime BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW(),
  CONSTRAINT date_fin_apres_debut CHECK (date_fin > date_debut)
);

CREATE INDEX idx_permis_numero ON permis(numero_permis);
CREATE INDEX idx_permis_statut ON permis(statut);
CREATE INDEX idx_permis_zone ON permis(zone_id);
CREATE INDEX idx_permis_type ON permis(type_permis_id);
CREATE INDEX idx_permis_demandeur ON permis(demandeur_id);
CREATE INDEX idx_permis_dates ON permis(date_debut, date_fin);

-- Table participants_permis
CREATE TABLE participants_permis (
  permis_id UUID REFERENCES permis(id) ON DELETE CASCADE,
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  habilitations JSONB,
  role_operationnel VARCHAR(100),
  PRIMARY KEY (permis_id, utilisateur_id)
);

-- Table approbations
CREATE TABLE approbations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permis_id UUID REFERENCES permis(id) ON DELETE CASCADE,
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE RESTRICT,
  role_app VARCHAR(50) NOT NULL,
  statut VARCHAR(20) NOT NULL CHECK (statut IN ('APPROUVE', 'REFUSE', 'SUSPENDU')),
  commentaire TEXT,
  date_action TIMESTAMP DEFAULT NOW(),
  signature_image_path VARCHAR(500),
  signature_hash VARCHAR(255)
);

CREATE INDEX idx_approbations_permis ON approbations(permis_id);
CREATE INDEX idx_approbations_utilisateur ON approbations(utilisateur_id);

-- Table audit_logs (immuable)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  cible_table VARCHAR(100),
  cible_id UUID,
  payload JSONB,
  ip_client VARCHAR(45),
  date_action TIMESTAMP DEFAULT NOW(),
  immutable BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_utilisateur ON audit_logs(utilisateur_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(date_action);
CREATE INDEX idx_audit_logs_cible ON audit_logs(cible_table, cible_id);

-- Table tokens_reset_mdp
CREATE TABLE tokens_reset_mdp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  date_expiration TIMESTAMP NOT NULL,
  utilise BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tokens_reset_token ON tokens_reset_mdp(token);
CREATE INDEX idx_tokens_reset_utilisateur ON tokens_reset_mdp(utilisateur_id);

-- Table refresh_tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  date_expiration TIMESTAMP NOT NULL,
  actif BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_utilisateur ON refresh_tokens(utilisateur_id);
