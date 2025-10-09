const Joi = require('joi');

const inscriptionSchema = Joi.object({
  nom: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères'
    }),
  prenom: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Le prénom est requis'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email invalide',
      'string.empty': 'L\'email est requis'
    }),
  // AJOUT : Accepter "password" OU "mot_de_passe"
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
    }),
  mot_de_passe: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
    }),
  telephone: Joi.string().allow('', null).optional(),
  role: Joi.string().valid('DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN')
    .default('DEMANDEUR')
})
  // IMPORTANT : S'assurer qu'au moins un des deux champs de mot de passe est présent
  .or('password', 'mot_de_passe')
  .messages({
    'object.missing': 'Le mot de passe est requis'
  });

const connexionSchema = Joi.object({
  email: Joi.string().email().required(),
  // Accepter les deux formats
  password: Joi.string(),
  mot_de_passe: Joi.string()
})
  .or('password', 'mot_de_passe')
  .messages({
    'object.missing': 'Le mot de passe est requis'
  });

const resetMotDePasseSchema = Joi.object({
  email: Joi.string().email().required()
});

const confirmResetSchema = Joi.object({
  token: Joi.string().required(),
  nouveau_mot_de_passe: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
});

module.exports = {
  inscriptionSchema,
  connexionSchema,
  resetMotDePasseSchema,
  confirmResetSchema
};