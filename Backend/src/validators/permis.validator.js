const Joi = require('joi');

const createPermisSchema = Joi.object({
  type_permis_id: Joi.string().uuid().required(),
  zone_id: Joi.string().uuid().required(),
  titre: Joi.string().min(5).max(200).required(),
  description: Joi.string().allow('').optional(),
  date_debut: Joi.date().iso().required(),
  date_fin: Joi.date().iso().greater(Joi.ref('date_debut')).required(),
  conditions_prealables: Joi.object().optional(),
  mesures_prevention: Joi.object().optional(),
  resultat_tests_atmos: Joi.object().optional()
});

const updatePermisSchema = Joi.object({
  titre: Joi.string().min(5).max(200).optional(),
  description: Joi.string().allow('').optional(),
  date_debut: Joi.date().iso().optional(),
  date_fin: Joi.date().iso().optional(),
  conditions_prealables: Joi.object().optional(),
  mesures_prevention: Joi.object().optional(),
  resultat_tests_atmos: Joi.object().optional(),
  statut: Joi.string().valid('BROUILLON', 'EN_ATTENTE', 'VALIDE', 'EN_COURS', 'SUSPENDU', 'CLOTURE').optional()
});

const validerPermisSchema = Joi.object({
  commentaire: Joi.string().allow('').optional(),
  signature_image: Joi.string().optional()
});

module.exports = {
  createPermisSchema,
  updatePermisSchema,
  validerPermisSchema
};

