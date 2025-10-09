class AuditLog {
  constructor(data) {
    this.id = data.id;
    this.action = data.action;
    this.utilisateur_id = data.utilisateur_id;
    this.cible_table = data.cible_table;
    this.cible_id = data.cible_id;
    this.payload = data.payload;
    this.ip_client = data.ip_client;
    this.date_action = data.date_action;
    this.immutable = data.immutable;
  }

  // Common audit actions
  static get ACTIONS() {
    return {
      INSCRIPTION: 'INSCRIPTION',
      CONNEXION: 'CONNEXION',
      CONNEXION_ECHEC: 'CONNEXION_ECHEC',
      DECONNEXION: 'DECONNEXION',
      CREATION_PERMIS: 'CREATION_PERMIS',
      MODIFICATION_PERMIS: 'MODIFICATION_PERMIS',
      VALIDATION_PERMIS: 'VALIDATION_PERMIS',
      SUSPENSION_PERMIS: 'SUSPENSION_PERMIS',
      CLOTURE_PERMIS: 'CLOTURE_PERMIS',
      SUPPRESSION_UTILISATEUR: 'SUPPRESSION_UTILISATEUR',
      ANONYMISATION_UTILISATEUR: 'ANONYMISATION_UTILISATEUR',
      RESET_MDP: 'RESET_MDP',
      DEMANDE_RESET_MDP: 'DEMANDE_RESET_MDP',
      EXPORT_PDF_PERMIS: 'EXPORT_PDF_PERMIS',
      AJOUT_FICHIER_PERMIS: 'AJOUT_FICHIER_PERMIS'
    };
  }

  // Format log for display
  format() {
    return {
      id: this.id,
      action: this.action,
      date: new Date(this.date_action).toLocaleString('fr-FR'),
      utilisateur: this.utilisateur_id || 'Système',
      cible: this.cible_table ? `${this.cible_table}:${this.cible_id}` : 'N/A',
      details: this.payload
    };
  }
}

module.exports = AuditLog;
