class Permis {
  constructor(data) {
    this.id = data.id;
    this.numero_permis = data.numero_permis;
    this.type_permis_id = data.type_permis_id;
    this.zone_id = data.zone_id;
    this.titre = data.titre;
    this.description = data.description;
    this.date_debut = data.date_debut;
    this.date_fin = data.date_fin;
    this.demandeur_id = data.demandeur_id;
    this.statut = data.statut;
    this.conditions_prealables = data.conditions_prealables;
    this.mesures_prevention = data.mesures_prevention;
    this.resultat_tests_atmos = data.resultat_tests_atmos;
    this.justificatifs = data.justificatifs;
    this.supprime = data.supprime;
    this.date_creation = data.date_creation;
    this.date_modification = data.date_modification;
  }

  // Permit statuses
  static get STATUT() {
    return {
      BROUILLON: 'BROUILLON',
      EN_ATTENTE: 'EN_ATTENTE',
      VALIDE: 'VALIDE',
      EN_COURS: 'EN_COURS',
      SUSPENDU: 'SUSPENDU',
      CLOTURE: 'CLOTURE'
    };
  }

  // Check if permit is active
  isActive() {
    return this.statut === Permis.STATUT.EN_COURS;
  }

  // Check if permit can be modified
  canBeModified() {
    return [Permis.STATUT.BROUILLON, Permis.STATUT.EN_ATTENTE].includes(this.statut);
  }

  // Check if permit is expired
  isExpired() {
    return new Date(this.date_fin) < new Date();
  }

  // Check if permit is valid for specific date
  isValidForDate(date) {
    const checkDate = new Date(date);
    return checkDate >= new Date(this.date_debut) && checkDate <= new Date(this.date_fin);
  }

  // Calculate permit duration in hours
  getDurationHours() {
    const debut = new Date(this.date_debut);
    const fin = new Date(this.date_fin);
    return (fin - debut) / (1000 * 60 * 60);
  }
}

module.exports = Permis;
