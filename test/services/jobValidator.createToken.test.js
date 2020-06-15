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
    'image': 'http://test.test.com/',
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
        {message: '"brand" is required', type: 'any.required'},
        {message: 'Image URL is not valid'}
      ]
    });
  });

  it('should fail if token ID is less than 1', async function () {
    const results = await jobValidator.isValidCreateTokenJob({
      ...validPayload,
      'token_id': 0,
    });
    results.should.be.deep.equal({
      valid: false,
      errors: [
        {message: '"token_id" must be larger than or equal to 1', type: 'number.min'},
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
      errors: [],
      valid: true
    });
  });

  it('should pass', async function () {
    const results = await jobValidator.isValidCreateTokenJob(validPayload);
    results.should.be.deep.equal({
      errors: [],
      valid: true
    });
  });

  describe('artist initials field checks', async function () {

    it('fails if less then 3 characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        artist_initials: 'AA'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {message: '"artist_initials" length must be at least 3 characters long', type: 'string.min'},
        ]
      });
    });

    it('fails if more then 3 characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        artist_initials: 'AAAA'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {message: '"artist_initials" length must be less than or equal to 3 characters long', type: 'string.max'},
        ]
      });
    });

    it('fails if not A-Z', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        artist_initials: 'AA7'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"artist_initials" with value "AA7" fails to match the required pattern: /^[A-Z]*$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });

    it('fails if has numbers in', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        artist_initials: 'AA!'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"artist_initials" with value "AA!" fails to match the required pattern: /^[A-Z]*$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });

    it('fails if not upper case', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        artist_initials: 'aBC'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"artist_initials" with value "aBC" fails to match the required pattern: /^[A-Z]*$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });

  });

  describe('series field checks', async function () {

    it('should fail if less than 3 characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        series: '01'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"series" length must be 3 characters long',
            type: 'string.length'
          },
        ]
      });
    });

    it('should fail if more than 3 characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        series: '0110'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"series" length must be 3 characters long',
            type: 'string.length'
          },
        ]
      });
    });

    it('should fail if not a number', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        series: '0A1'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"series" with value "0A1" fails to match the required pattern: /^\\d+$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });

    it('should fail if contains special characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        series: '10!'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"series" with value "10!" fails to match the required pattern: /^\\d+$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });

    it('should fail if is not number only', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        series: '10a'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"series" with value "10a" fails to match the required pattern: /^\\d+$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });

  });

  describe('design field checks', async function () {

    it('should fail if less than 3 characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        design: '011'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"design" length must be 4 characters long',
            type: 'string.length'
          },
        ]
      });
    });

    it('should fail if more than 3 characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        design: '011'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"design" length must be 4 characters long',
            type: 'string.length'
          },
        ]
      });
    });

    it('should fail if not a number', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        design: '0A11'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"design" with value "0A11" fails to match the required pattern: /^\\d+$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });

    it('should fail if contains special characters', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        design: '100!'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {
            message: '"design" with value "100!" fails to match the required pattern: /^\\d+$/',
            type: 'string.pattern.base'
          },
        ]
      });
    });


  });

  describe('image url checks', async function() {
    it('should fail with a blank image url', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        image: ''
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {message: '"image" is not allowed to be empty', type: 'string.empty'},
          {message: 'Image URL is not valid'}
        ]
      });
    });

    it('should fail with an invalid image url', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        image: 'http://127.0.0.1:3000/does/not/work'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {message: 'Image URL is not valid'}
        ]
      });
    });

    it('should fail with an image url that returns a 404', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        image: 'https://github.com/blockrockettechf'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {message: 'Image URL is not valid'}
        ]
      });
    });

    it('should fail with an image url that returns a 500', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        image: 'https://api.cryptokaiju.io/api/network/1/token/nfc/x'
      });
      results.should.be.deep.equal({
        valid: false,
        errors: [
          {message: 'Image URL is not valid'}
        ]
      });
    });

    it('should pass with a redirect image url (with http 302 code)', async function () {
      const results = await jobValidator.isValidCreateTokenJob({
        ...validPayload,
        image: 'https://cdn.knownorigin.io/cdn/images/network/1/edition/154200'
      });
      results.should.be.deep.equal({
        valid: true,
        errors: []
      });
    });
  });
});
