const _ = require('lodash');
const {jobValidator} = require('../../src/services');

describe('Job validation tests', function () {

  const validPayload = {
    'token_id': 1,
    'coo': 'USA',
    'artist_initials': 'RSA',
    'series': 2,
    'design': 3,
    'name': 'token 1',
    'description': 'token 1 description',
    'image': 'http://test.test.com',
    'artist': 'artist',
    'artist_assistant': 'assistant',
    'brand': 'brand',
    'model': 'model',
    'purchase_location': 'london',
    'purchase_date': '2020-02-01',
    'customization_location': 'tokyo',
    'customization_date': '2020-02-06',
    'materials_used': [
      'a',
      'b'
    ],
  };

  it('should fail if empty', async function () {
    const results = await jobValidator.isValidCreateTokenJob({});
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"token_id" is required', type: 'any.required'},
        {message: '"coo" is required', type: 'any.required'},
        {message: '"artist_initials" is required', type: 'any.required'},
        {message: '"series" is required', type: 'any.required'},
        {message: '"design" is required', type: 'any.required'},
        {message: '"name" is required', type: 'any.required'},
        {message: '"description" is required', type: 'any.required'},
        {message: '"image" is required', type: 'any.required'},
        {message: '"artist" is required', type: 'any.required'},
        {message: '"artist_assistant" is required', type: 'any.required'},
        {message: '"brand" is required', type: 'any.required'},
        {message: '"model" is required', type: 'any.required'},
        {message: '"purchase_location" is required', type: 'any.required'},
        {message: '"purchase_date" is required', type: 'any.required'},
        {message: '"customization_location" is required', type: 'any.required'},
        {message: '"customization_date" is required', type: 'any.required'},
        {message: '"materials_used" is required', type: 'any.required'}
      ]
    });
  });

  it('should fail if with unknown', async function () {
    const results = await jobValidator.isValidCreateTokenJob({
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

  it('should fail if token_id is not a number', async function () {
    const results = await jobValidator.isValidCreateTokenJob({
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

  it('should pass', async function () {
    const results = await jobValidator.isValidCreateTokenJob(validPayload);
    esults.should.be.deep.equal({
      valid: true
    });
  });


});
