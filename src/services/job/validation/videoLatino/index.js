const axios = require('axios');

const {validateData} = require('../schemaBasedValidator');

const urlValidator = require('../../../urlValidator');

const CREATE_TOKEN_SCHEMA = require('./schema/createTokenSchema');

module.exports = {
  isValidCreateTokenJob: async (jobData) => {
    const isDataValid = await validateData(CREATE_TOKEN_SCHEMA, jobData);
    const isImageUrlValid = await urlValidator(axios, jobData.image);
    const isVideoUrlValid = await urlValidator(axios, jobData.video_link);

    const errors = isDataValid.errors || [];
    if (!isImageUrlValid) {
      errors.push({message: 'Image URL is not valid'});
    }

    if (!isVideoUrlValid) {
      errors.push({message: 'Video Link URL is not valid'});
    }

    return {
      errors,
      valid: isDataValid.valid && errors.length === 0
    };
  },
};
