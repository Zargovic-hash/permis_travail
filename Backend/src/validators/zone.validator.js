const Joi = require('joi');

const createZoneSchema = Joi.object({
  nom: Joi.string().min(3).max(200).required()
    .messages({
      'string.empty': 'Le nom de la zone est requis',
      'string.min': 'Le nom doit contenir au moins 3 caractères'
    }),
  description: Joi.string().allow('').optional(),
  responsable_id: Joi.string().uuid().required()
    .messages({
      'string.empty': 'Le responsable de zone est requis',
      'string.guid': 'ID de responsable invalide'
    })
});

const updateZoneSchema = Joi.object({
  nom: Joi.string().min(3).max(200).optional(),
  description: Joi.string().allow('').optional(),
  responsable_id: Joi.string().uuid().optional()
});

module.exports = {
  createZoneSchema,
  updateZoneSchema
};
