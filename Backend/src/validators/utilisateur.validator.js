const Joi = require('joi');

const updateUtilisateurSchema = Joi.object({
  nom: Joi.string().min(2).max(100).optional(),
  prenom: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN').optional(),
  habilitations: Joi.object().optional(),
  actif: Joi.boolean().optional()
}).messages({
  'string.min': 'Le champ doit contenir au moins {#limit} caractères',
  'string.email': 'Email invalide'
});

module.exports = {
  updateUtilisateurSchema
};
