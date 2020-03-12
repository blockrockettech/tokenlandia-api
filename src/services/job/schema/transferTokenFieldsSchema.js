const Joi = require('@hapi/joi');

module.exports = Joi.object({
  token_id: Joi.number().integer().min(0).required(),
  recipient: Joi.string().alphanum().min(42).max(42).required(),
});
