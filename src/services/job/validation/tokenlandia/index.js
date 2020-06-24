const axios = require('axios');

const {validateData} = require('../schemaBasedValidator');

const urlValidator = require('../../../urlValidator');

const CREATE_TOKEN_SCHEMA = require('./schema/createTokenSchema');
const UPDATE_TOKEN_FIELDS_SCHEMA = require('./schema/updateTokenFieldsSchema');
const TRANSFER_TOKEN_FIELDS_SCHEMA = require('./schema/transferTokenFieldsSchema');

module.exports = {
  isValidCreateTokenJob: async (jobData) => {
    const isDataValid = await validateData(CREATE_TOKEN_SCHEMA, jobData);
    const isUrlValid = await urlValidator(axios, jobData.image);

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
