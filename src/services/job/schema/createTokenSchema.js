const _ = require('lodash');
const Joi = require('@hapi/joi');

const countryCodes = require('../../../data/country_codes');

const YYYY_MM_DD_PATTERN = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))+$/;

const isCountryCodeValid = (value) => {
  return _.find(countryCodes, (countryData) => {
    const shortCode = countryData['alpha-3'];
    return shortCode === value.toUpperCase();
  });
};

const countryCodeValidator = (value, helpers) => {
  if (!isCountryCodeValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

module.exports = Joi.object({

  token_id: Joi.number().integer().min(1).required(),

  coo: Joi.string().min(3).max(3).case('upper').required().custom(countryCodeValidator, 'COO is not valid country code'),

  artist_initials: Joi.string().regex(/^[A-Z]*$/).min(3).max(3).required(),

  // Any digit 0-9
  series: Joi.string().length(3).regex(/^\d+$/).required(),

  // Any digit 0-9
  design: Joi.string().length(4).regex(/^\d+$/).required(),

  name: Joi.string().min(1).max(125).required(),

  description: Joi.string().min(1).max(300).required(),

  image: Joi.string().min(1).uri().required(),

  artist: Joi.string().min(1).max(125).optional(),

  artist_assistant: Joi.string().min(1).max(125).optional(),

  brand: Joi.string().min(1).max(125).required(),

  model: Joi.string().min(1).max(125).optional(),

  ////////////////////////////////////
  // Fields which can updated later //
  ////////////////////////////////////

  purchase_location: Joi.string().min(0).max(125).optional(),
  purchase_date: Joi.string().optional().pattern(YYYY_MM_DD_PATTERN),

  customization_location: Joi.string().min(0).max(125).optional(),
  customization_date: Joi.string().optional().pattern(YYYY_MM_DD_PATTERN),

  material_1: Joi.string().min(1).max(40).optional(),
  material_2: Joi.string().min(1).max(40).optional(),
  material_3: Joi.string().min(1).max(40).optional(),
  material_4: Joi.string().min(1).max(40).optional(),
  material_5: Joi.string().min(1).max(40).optional(),

});
