const countryCodes = require('../../data/country_codes');

const _ = require('lodash');
const Joi = require('@hapi/joi');

const YYYY_MM_DD_PATTERN = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))+$/;

const CREATE_TOKEN_SCHEMA = Joi.object({

  token_id: Joi.number().integer().min(0).required(),

  // TODO validate COO against country codes
  coo: Joi.string().min(3).max(3).case('upper').required(),

  artist_initials: Joi.string().alphanum().min(1).max(4).required(),

  // TODO pad to 001
  series: Joi.number().integer().min(1).max(999).required(),

  // TODO pad to 0001
  design: Joi.number().integer().min(1).max(9990).required(),

  name: Joi.string().min(1).max(125).required(),

  description: Joi.string().min(1).max(300).required(),

  image: Joi.string().uri().required(),

  artist: Joi.string().required(),

  // Optional
  artist_assistant: Joi.string().alphanum(),

  brand: Joi.string().required(),

  model: Joi.string().required(),

  // Optional
  purchase_location: Joi.string(),
  purchase_date: Joi.string().pattern(YYYY_MM_DD_PATTERN),
  customization_location: Joi.string(),
  customization_date: Joi.string().pattern(YYYY_MM_DD_PATTERN),

  materials_used: Joi.array().items(
    Joi.string().alphanum().min(1).max(40)
  ).min(0).max(5),

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

const isCountryCodeValid = (countryCode) => {
  const countryData = _.find(countryCodes, (countryData) => {
    const shortCode = countryData['alpha-3'];
    return shortCode === countryCode.toUpperCase();
  });
  return !!countryData;
};

module.exports = {
  isValidCreateTokenJob,
  isCountryCodeValid
};
