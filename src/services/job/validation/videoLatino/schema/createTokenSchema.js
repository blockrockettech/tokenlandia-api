const _ = require('lodash');
const Joi = require('@hapi/joi');

const countryCodes = require('../../../../../data/country_codes');

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

const categoryValidator = (value, helpers) => {
  if (value !== 'VideoSaludos' || value !== 'PubliVideos') {
    return helpers.error('any.invalid');
  }

  return value;
};

module.exports = Joi.object({

  token_id: Joi.number().integer().min(1).required(),

  coo: Joi.string().min(3).max(3).case('upper').required().custom(countryCodeValidator, 'COO is not valid country code'),

  celebrity_initials: Joi.string().regex(/^[A-Z]*$/).min(1).max(3).required(),

  name: Joi.string().min(1).max(125).required(),

  description: Joi.string().min(1).max(300).required(),

  image: Joi.string().min(1).uri().required(),

  video_link: Joi.string().min(1).uri().required(),

  video_category: Joi.string().min(1).max(30).required().custom(categoryValidator, 'Video category is invalid'),

  video_language: Joi.string().min(1).max(30).required(),

  celebrity_name: Joi.string().min(1).max(50).required(),

  creation_location: Joi.string().min(1).max(125).required(),
  creation_date: Joi.string().required().pattern(YYYY_MM_DD_PATTERN),

  business_brand: Joi.string().min(1).max(50).required(),
});
