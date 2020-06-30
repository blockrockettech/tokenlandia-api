const Joi = require('@hapi/joi');
const {TOKEN_TYPE} = require('../../../../job/jobConstants');

const tokenTypeValidator = (value, helpers) => {
  if (value !== TOKEN_TYPE.TOKENLANDIA && value !== TOKEN_TYPE.VIDEO_LATINO) {
    return helpers.error('any.invalid');
  }

  return value;
};

module.exports = Joi.object({
  token_id: Joi.number().integer().min(0).required(),
  token_type: Joi.string().min(TOKEN_TYPE.TOKENLANDIA.length).max(TOKEN_TYPE.VIDEO_LATINO.length).required().custom(tokenTypeValidator, 'Token type specified is invalid'),
  recipient: Joi.string().alphanum().min(42).max(42).required(),
});
