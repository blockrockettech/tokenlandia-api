const _ = require('lodash');
const {jobValidator} = require('../../src/services');

describe('Job validation - Create Token', function () {

  const validPayload = {
    'token_id': 1,
    'coo': 'USA',
    'artist_initials': 'RSA',
    'series': '002',
    'design': '0003',
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
    'material_1': 'a',
    'material_2': 'b',
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
        {message: '"brand" is required', type: 'any.required'},
        {message: '"model" is required', type: 'any.required'},
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

    it('should fail for invalid country code', async function () {
    const results = await jobValidator.isValidCreateTokenJob({
      ...validPayload,
      'coo': 'AAA',
    });
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"coo" contains an invalid value', type: 'any.invalid'},
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

  it('should allow creation without 5 optional fields', async function () {
    const results = await jobValidator.isValidCreateTokenJob({
      ..._.omit(validPayload, [
        'purchase_location',
        'purchase_date',
        'customization_location',
        'customization_date',
        'material_1',
        'material_2',
        'material_3',
        'material_4',
        'material_5',
      ])
    });
    results.should.be.deep.equal({
      valid: true
    });
  });

  it('should pass', async function () {
    const results = await jobValidator.isValidCreateTokenJob(validPayload);
    results.should.be.deep.equal({
      valid: true
    });
  });


});
