const _ = require('lodash');
const Joi = require('@hapi/joi');

const YYYY_MM_DD_PATTERN = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))+$/;

module.exports = Joi.object({

  token_id: Joi.number().integer().min(0).required(),

  purchase_location: Joi.string().min(0).max(125).required(),
  purchase_date: Joi.string().min(0).max(125).required().pattern(YYYY_MM_DD_PATTERN),

  customization_location: Joi.string().min(0).max(125).required(),
  customization_date: Joi.string().required().pattern(YYYY_MM_DD_PATTERN),

  material_1: Joi.string().alphanum().min(1).max(40).required(),
  material_2: Joi.string().alphanum().min(1).max(40).optional(),
  material_3: Joi.string().alphanum().min(1).max(40).optional(),
  material_4: Joi.string().alphanum().min(1).max(40).optional(),
  material_5: Joi.string().alphanum().min(1).max(40).optional(),

});
