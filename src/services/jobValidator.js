const countryCodes = require('../data/country_codes');

const _ = require('lodash');
const Joi = require('@hapi/joi');

const test = {
  'token_id': 1,
  'recipient': '0x12D062B19a2DF1920eb9FC28Bd6E9A7E936de4c2',
  'coo': 'USA',
  'artist_initials': 'RSA',
  'series': 2,
  'design': 3,
  'name': 'token 1',
  'description': 'token 1 description',
  'image': 'http://test.test.com',
  'artist': 'artist',
  'artist_assistant': 'assistant',
  'brand': 'brand',
  'model': 'model',
  'purchase_location': 'london',
  'purchase_date': '2020-02-01',
  'customization_location': 'tokyo',
  'customization_date': '2020-02-06',
  'materials_used': [
    'a',
    'b'
  ],
};
//Only 1 value needs to be supplied for ‘materials_used’
// recipient: "0x12D062B19a2DF1920eb9FC28Bd6E9A7E936de4c2"

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