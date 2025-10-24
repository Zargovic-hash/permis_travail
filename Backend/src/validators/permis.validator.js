const Joi = require('joi');

const createPermisSchema = Joi.object({
  type_permis_id: Joi.string().required()
    .messages({
      'string.empty': 'Le type de permis est requis',
      'any.required': 'Le type de permis est requis'
    }),
  
  zone_id: Joi.string().required()
    .messages({
      'string.empty': 'La zone est requise',
      'any.required': 'La zone est requise'
    }),
  
  titre: Joi.string().min(5).max(200).required()
    .messages({
      'string.min': 'Le titre doit contenir au moins 5 caractères',
      'any.required': 'Le titre est requis'
    }),
  
  description: Joi.string().allow('', null).optional(),
  
  // ✅ FIX: Accepter les formats ISO et datetime-local HTML5
  date_debut: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  ).required()
    .messages({
      'any.required': 'La date de début est requise',
      'alternatives.match': 'Format de date invalide'
    }),
  
  date_fin: Joi.alternatives().try(
    Joi.date().iso().greater(Joi.ref('date_debut')),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  ).required()
    .messages({
      'any.required': 'La date de fin est requise',
      'date.greater': 'La date de fin doit être après la date de début'
    }),
  
  conditions_prealables: Joi.object().optional().default({}),
  mesures_prevention: Joi.object().optional().default({}),
  resultat_tests_atmos: Joi.object().optional().default({}),
  
  statut: Joi.string().valid('BROUILLON', 'EN_ATTENTE').optional()
});

const updatePermisSchema = Joi.object({
  titre: Joi.string().min(5).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  
  date_debut: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  ).optional(),
  
  date_fin: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  ).optional(),
  
  conditions_prealables: Joi.object().optional(),
  mesures_prevention: Joi.object().optional(),
  resultat_tests_atmos: Joi.object().optional(),
  
  statut: Joi.string().valid('BROUILLON', 'EN_ATTENTE', 'VALIDE', 'EN_COURS', 'SUSPENDU', 'CLOTURE').optional()
});

const validerPermisSchema = Joi.object({
  commentaire: Joi.string().allow('', null).optional(),
  signature_image: Joi.string().allow('', null).optional()
});

module.exports = {
  createPermisSchema,
  updatePermisSchema,
  validerPermisSchema
};