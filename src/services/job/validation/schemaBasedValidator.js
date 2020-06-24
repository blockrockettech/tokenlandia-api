const _ = require('lodash');

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
  validateData
}
