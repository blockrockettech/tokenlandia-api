const sinon = require('sinon');

const axios = require('axios');

const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../../../src');

chai.use(chaiHttp);
chai.should();

function getBaseUrl(chainId) {
  return `/v1/network/${chainId}/job`;
}

describe('Job processing route', () => {

  afterEach(function () {
    sinon.restore();
  });

  describe('route validation', function () {

    describe('validating chain ID', async function () {
      it('fails in invalid chain ID', async function () {
        const invalidChainId = 99;

        const res = await chai.request(app)
          .post(`${getBaseUrl(invalidChainId)}/submit/createtoken`)
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
          .post(`${getBaseUrl(chainId)}/submit/createtoken`)
          .set('authorization', `Bearer ${invalidAPiKey}`)
          .send({});

        res.should.not.be.empty;
        res.status.should.be.equal(403);
        res.body.should.be.deep.equal({
          'error': 'Please provide a valid API access token'
        });
      });
    });

  });

});
