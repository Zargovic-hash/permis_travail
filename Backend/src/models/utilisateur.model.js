class Utilisateur {
  constructor(data) {
    this.id = data.id;
    this.nom = data.nom;
    this.prenom = data.prenom;
    this.email = data.email;
    this.role = data.role;
    this.habilitations = data.habilitations;
    this.signature_image_path = data.signature_image_path;
    this.actif = data.actif;
    this.supprime = data.supprime;
    this.anonymise = data.anonymise;
    this.date_creation = data.date_creation;
    this.date_modification = data.date_modification;
  }

  // Check if user has specific role
  hasRole(...roles) {
    return roles.includes(this.role);
  }

  // Check if user is HSE (superuser)
  isHSE() {
    return this.role === 'HSE';
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'ADMIN';
  }

  // Check if user can manage all resources
  isSuperUser() {
    return this.role === 'HSE' || this.role === 'ADMIN';
  }

  // Get full name
  getFullName() {
    return `${this.prenom} ${this.nom}`;
  }

  // Convert to safe object (without sensitive data)
  toSafeObject() {
    const obj = { ...this };
    delete obj.mot_de_passe_hash;
    return obj;
  }
}

module.exports = Utilisateur;

