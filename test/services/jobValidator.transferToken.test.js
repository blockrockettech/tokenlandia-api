const _ = require('lodash');
const {generalJobValidator} = require('../../src/services');

describe('Job validation - Transfer Token', function () {

  const validPayload = {
    'token_id': 1,
    'token_type': 'TOKENLANDIA',
    'recipient': '0x818Ff73A5d881C27A945bE944973156C01141232',
  };

  it('should fail if empty', async function () {
    const results = await generalJobValidator.isValidTransferTokenJob({});
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"token_id" is required', type: 'any.required'},
        {message: '"token_type" is required', type: 'any.required'},
        {message: '"recipient" is required', type: 'any.required'},
      ]
    });
  });

  it('should fail if with unknown', async function () {
    const results = await generalJobValidator.isValidTransferTokenJob({
      ...validPayload,
      unknown_field: 'abc'
    });
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"unknown_field" is not allowed', type: 'object.unknown'},
      ]
    });
  });

  it('should pass', async function () {
    const results = await generalJobValidator.isValidTransferTokenJob(validPayload);
    results.should.be.deep.equal({
      valid: true
    });
  });

  it('should fail if token_id is not a number', async function () {
    const results = await generalJobValidator.isValidTransferTokenJob({
      ...validPayload,
      'token_id': 'abc',
    });
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"token_id" must be a number', type: 'number.base'},
      ]
    });
  });

  it('should fail if recipient is not correct length', async function () {
    const results = await generalJobValidator.isValidTransferTokenJob({
      ...validPayload,
      'recipient': 'akjdshakjdhkjash',
    });
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"recipient" length must be at least 42 characters long', type: 'string.min'},
      ]
    });
  });
});
