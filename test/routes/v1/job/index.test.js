const sinon = require('sinon');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../../../../src');

function getBaseUrl(chainId) {
  return `/v1/network/${chainId}/job`;
}

describe('Job processing route', () => {

  afterEach(function () {
    sinon.restore();
  });

  describe('create token job', function () {

    describe('validating chain ID', async function () {
      it('fails in invalid chain ID', async function () {
        const invalidChainId = 99;

        const res = await chai.request(app)
          .post(`${getBaseUrl(invalidChainId)}/submit/createtoken/general`)
          .send({});

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Invalid chain ID [99]'
        });
      });
    });

    describe('validating bearer token', async function () {
      it('fails in invalid token', async function () {
        const chainId = 1;

        const invalidAPiKey = 'invalid-key';

        const res = await chai.request(app)
          .post(`${getBaseUrl(chainId)}/submit/createtoken/general?key=${invalidAPiKey}`)
          .send({});

        res.should.not.be.empty;
        res.status.should.be.equal(403);
        res.body.should.be.deep.equal({
          'error': 'Please provide a valid API access token'
        });
      });
    });

    describe('validating duplicate token', async function () {
      it('fails if token already exists', async function () {
        const chainId = 4;

        const API_ACCESS_KEY = process.env.API_ACCESS_KEY;

        const res = await chai.request(app)
          .post(`${getBaseUrl(chainId)}/submit/createtoken/general?key=${API_ACCESS_KEY}`)
          .send({
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
          });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Token already created'
        });
      });
    });
  });

  describe('update token job', () => {

    describe('validating chain ID', async function () {
      it('fails in invalid chain ID', async function () {
        const invalidChainId = 99;

        const res = await chai.request(app)
          .post(`${getBaseUrl(invalidChainId)}/submit/updatetoken/general`)
          .send({});

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Invalid chain ID [99]'
        });
      });
    });

    describe('validating bearer token', async function () {
      it('fails in invalid token', async function () {
        const chainId = 1;

        const invalidAPiKey = 'invalid-key';

        const res = await chai.request(app)
          .post(`${getBaseUrl(chainId)}/submit/updatetoken/general?key=${invalidAPiKey}`)
          .send({});

        res.should.not.be.empty;
        res.status.should.be.equal(403);
        res.body.should.be.deep.equal({
          'error': 'Please provide a valid API access token'
        });
      });
    });

    describe('validating duplicate token', async function () {
      it('fails if token does not exists', async function () {
        const chainId = 4;

        const API_ACCESS_KEY = process.env.API_ACCESS_KEY;

        const res = await chai.request(app)
          .post(`${getBaseUrl(chainId)}/submit/updatetoken/general?key=${API_ACCESS_KEY}`)
          .send({
            'token_id': 9999999,
            'purchase_location': 'london',
            'purchase_date': '2020-02-01',
            'customization_location': 'tokyo',
            'customization_date': '2020-02-06',
            'material_1': 'a',
          });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Token does not exist'
        });
      });
    });
  });

});
