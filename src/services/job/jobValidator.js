const _ = require('lodash');
const axios = require('axios');

const imageUrlValidator = require('../imageUrlValidator');

const CREATE_TOKEN_SCHEMA = require('./schema/createTokenSchema');
const UPDATE_TOKEN_FIELDS_SCHEMA = require('./schema/updateTokenFieldsSchema');
const TRANSFER_TOKEN_FIELDS_SCHEMA = require('./schema/transferTokenFieldsSchema');

const validateData = async (schema, data) => {
  const {error} = await schema.validate(data, {
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
  isValidCreateTokenJob: async (jobData) => {
    const isDataValid = await validateData(CREATE_TOKEN_SCHEMA, jobData);
    const isUrlValid = await imageUrlValidator(axios, jobData.image);

    const errors = isDataValid.errors || [];
    if (!isUrlValid) {
      errors.push({message: 'Image URL is not valid'});
    }

    return {
      errors,
      valid: isDataValid.valid && isUrlValid
    };
  },
  isValidUpdateTokenJob: async (jobData) => {
    return validateData(UPDATE_TOKEN_FIELDS_SCHEMA, jobData);
  },
  isValidTransferTokenJob: async (jobData) => {
    return validateData(TRANSFER_TOKEN_FIELDS_SCHEMA, jobData);
  },
};
