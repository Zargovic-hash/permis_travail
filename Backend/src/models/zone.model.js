class Zone {
  constructor(data) {
    this.id = data.id;
    this.nom = data.nom;
    this.description = data.description;
    this.responsable_id = data.responsable_id;
  }

  // Validate zone data
  static validate(data) {
    const errors = [];
    
    if (!data.nom || data.nom.trim().length < 3) {
      errors.push('Le nom de la zone doit contenir au moins 3 caractères');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Zone;
