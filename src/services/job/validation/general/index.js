const {validateData} = require('../schemaBasedValidator');

const TRANSFER_TOKEN_FIELDS_SCHEMA = require('./schema/transferTokenFieldsSchema');

module.exports = {
  isValidTransferTokenJob: async (jobData) => {
    return validateData(TRANSFER_TOKEN_FIELDS_SCHEMA, jobData);
  },
};
