const Joi = require('joi');

const createTypePermisSchema = Joi.object({
  nom: Joi.string().min(3).max(200).required()
    .messages({
      'string.empty': 'Le nom du type de permis est requis',
      'string.min': 'Le nom doit contenir au moins 3 caractères'
    }),
  description: Joi.string().allow('').optional()
});

const updateTypePermisSchema = Joi.object({
  nom: Joi.string().min(3).max(200).optional(),
  description: Joi.string().allow('').optional()
});

module.exports = {
  createTypePermisSchema,
  updateTypePermisSchema
};