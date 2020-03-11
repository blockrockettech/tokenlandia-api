const _ = require('lodash');
const {jobValidator} = require('../../src/services');

describe('Job validation - Update Token', function () {

  const validPayload = {
    'purchase_location': 'london',
    'purchase_date': '2020-02-01',
    'customization_location': 'tokyo',
    'customization_date': '2020-02-06',
    'material_1': 'a',
    'material_2': 'b',
  };

  it('should fail if empty', async function () {
    const results = await jobValidator.isValidUpdateTokenJob({});
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"purchase_location" is required', type: 'any.required'},
        {message: '"purchase_date" is required', type: 'any.required'},
        {message: '"customization_location" is required', type: 'any.required'},
        {message: '"customization_date" is required', type: 'any.required'},
        {message: '"material_1" is required', type: 'any.required'},
      ]
    });
  });

  it('should fail if with unknown', async function () {
    const results = await jobValidator.isValidUpdateTokenJob({
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
    const results = await jobValidator.isValidUpdateTokenJob(validPayload);
    results.should.be.deep.equal({
      valid: true
    });
  });


});
