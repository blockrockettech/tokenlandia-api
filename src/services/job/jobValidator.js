const _ = require('lodash');

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
    return validateData(CREATE_TOKEN_SCHEMA, jobData);
  },
  isValidUpdateTokenJob: async (jobData) => {
    return validateData(UPDATE_TOKEN_FIELDS_SCHEMA, jobData);
  },
  isValidTransferTokenJob: async (jobData) => {
    return validateData(TRANSFER_TOKEN_FIELDS_SCHEMA, jobData);
  },
};
