class TypePermis {
  constructor(data) {
    this.id = data.id;
    this.nom = data.nom;
    this.description = data.description;
  }

  // Common permit types
  static get TYPES() {
    return {
      FEU: 'Permis Feu',
      ESPACE_CONFINE: 'Permis Espace Confiné',
      ELECTRIQUE: 'Permis Électrique',
      HAUTEUR: 'Permis Travaux en Hauteur',
      EXCAVATION: 'Permis Excavation',
      LOTO: 'Permis LOTO (Lock Out Tag Out)'
    };
  }

  // Validate type data
  static validate(data) {
    const errors = [];
    
    if (!data.nom || data.nom.trim().length < 3) {
      errors.push('Le nom du type de permis doit contenir au moins 3 caractères');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = TypePermis;
