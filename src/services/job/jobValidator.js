const countryCodes = require('../../data/country_codes');

const _ = require('lodash');
const Joi = require('@hapi/joi');

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

const CREATE_TOKEN_SCHEMA = Joi.object({

  token_id: Joi.number().integer().min(0).required(),

  coo: Joi.string().min(3).max(3).case('upper').required().custom(countryCodeValidator, "custom validation"),

  artist_initials: Joi.string().alphanum().min(1).max(4).required(),

  series: Joi.string().min(3).max(3).required(),

  design: Joi.string().min(4).max(4).required(),

  name: Joi.string().min(1).max(125).required(),

  description: Joi.string().min(1).max(300).required(),

  image: Joi.string().min(1).max(125).uri().required(),

  artist: Joi.string().min(1).max(125).required(),

  artist_assistant: Joi.string().alphanum().min(1).max(125).optional(),

  brand: Joi.string().min(1).max(125).required(),

  model: Joi.string().min(1).max(125).required(),

  ///////////////////////////
  // Optional fields below //
  ///////////////////////////

  purchase_location: Joi.string().min(0).max(125).optional(),
  purchase_date: Joi.string().min(0).max(125).optional().pattern(YYYY_MM_DD_PATTERN),

  customization_location: Joi.string().min(0).max(125).optional(),
  customization_date: Joi.string().optional().pattern(YYYY_MM_DD_PATTERN),

  material_1: Joi.string().alphanum().min(1).max(40).optional(),
  material_2: Joi.string().alphanum().min(1).max(40).optional(),
  material_3: Joi.string().alphanum().min(1).max(40).optional(),
  material_4: Joi.string().alphanum().min(1).max(40).optional(),
  material_5: Joi.string().alphanum().min(1).max(40).optional(),

});

const isValidCreateTokenJob = async (jobData) => {
  const {error} = await CREATE_TOKEN_SCHEMA.validate(jobData, {
    presence: 'required', // prevent null/empty
    abortEarly: false // validates all fields
  });
  if (error) {

    const errors = _.map(error.details, (details) => {
      const {message, type} = details;
      return {message, type};
    });

    return {
      valid: false,
      errors
    };
  }
  return {valid: true};
};

module.exports = {
  isValidCreateTokenJob,
  isCountryCodeValid
};
