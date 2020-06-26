const sinon = require('sinon');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const {JOB_STATUS} = require('../../../../src/services/job/jobConstants');

const API_ACCESS_KEY = process.env.API_ACCESS_KEY;

describe('Job processing route tests (General)', () => {
  this.timeout(0);


  beforeEach(function () {
    this.now = Date.now();
    this.clock = sinon.useFakeTimers(this.now);
  });

  afterEach(function () {
    sinon.restore();
    this.clock.restore();
  });

  describe('transfer token job', function () {

    describe('validating chain ID', async function () {
      it('fails in invalid chain ID', async function () {
        const invalidChainId = 99;

        const res = await chai.request(require('../../../../src'))
          .post(`${getBaseUrl(invalidChainId)}/submit/transfer`)
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

        const res = await chai.request(require('../../../../src'))
          .post(`${getBaseUrl(chainId)}/submit/transfer?key=${invalidAPiKey}`)
          .send({});

        res.should.not.be.empty;
        res.status.should.be.equal(403);
        res.body.should.be.deep.equal({
          'error': 'Please provide a valid API access token'
        });
      });
    });

    describe('validating job data', async function () {
      it('fails with empty body', async function () {
        const chainId = 4;

        const res = await chai.request(require('../../../../src'))
          .post(`${getBaseUrl(chainId)}/submit/transfer?key=${API_ACCESS_KEY}`)
          .send({});

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Invalid job data',
          'details': [
            {
              "message": "\"token_id\" is required",
              "type": "any.required"
            },
            {
              "message": "\"token_type\" is required",
              "type": "any.required"
            },
            {
              "message": "\"recipient\" is required",
              "type": "any.required"
            }
          ]
        });
      });
      it('fails when token id is missing', async function () {
        const chainId = 4;

        const res = await chai.request(require('../../../../src'))
            .post(`${getBaseUrl(chainId)}/submit/transfer?key=${API_ACCESS_KEY}`)
            .send({
              "token_type": "TOKENLANDIA",
              "recipient": "0xD677AEd0965AC9B54e709F01A99cEcA205aebC4B"
            });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Invalid job data',
          'details': [
            {
              "message": "\"token_id\" is required",
              "type": "any.required"
            }
          ]
        });
      });
      it('fails when token type is missing', async function () {
        const chainId = 4;

        const res = await chai.request(require('../../../../src'))
            .post(`${getBaseUrl(chainId)}/submit/transfer?key=${API_ACCESS_KEY}`)
            .send({
              "token_id": "3",
              "recipient": "0xD677AEd0965AC9B54e709F01A99cEcA205aebC4B"
            });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Invalid job data',
          'details': [
            {
              "message": "\"token_type\" is required",
              "type": "any.required"
            }
          ]
        });
      });
      it('fails when recipient is missing', async function () {
        const chainId = 4;

        const res = await chai.request(require('../../../../src'))
            .post(`${getBaseUrl(chainId)}/submit/transfer?key=${API_ACCESS_KEY}`)
            .send({
              "token_type": "TOKENLANDIA",
              "token_id": "4"
            });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Invalid job data',
          'details': [
            {
              "message": "\"recipient\" is required",
              "type": "any.required"
            }
          ]
        });
      });
      it('fails when recipient is invalid', async function () {
        const chainId = 4;

        const invalidRecipient = "0xD677AEd0965AC9B54e709F01A99cEcA205aebC4r";
        const res = await chai.request(require('../../../../src'))
            .post(`${getBaseUrl(chainId)}/submit/transfer?key=${API_ACCESS_KEY}`)
            .send({
              "token_id": 1,
              "token_type": "TOKENLANDIA",
              "recipient": invalidRecipient
            });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': `Rejecting TOKENLANDIA incoming job - recipient [${invalidRecipient}] is not a valid web3 address`,
        });
      });
    });

    describe('validating escrow status', async function() {
      it('fails when token is not escrowed', async function() {
        const chainId = 4;

        const res = await chai.request(require('../../../../src'))
            .post(`${getBaseUrl(chainId)}/submit/transfer?key=${API_ACCESS_KEY}`)
            .send({
              "recipient": "0xD677AEd0965AC9B54e709F01A99cEcA205aebC4B",
              "token_type": "TOKENLANDIA",
              "token_id": "99999"
            });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': `Rejecting incoming TOKENLANDIA job - tokenId [99999] is not escrowed for chainId [4]`
        });
      });
    });

    describe('validating jobs - in flight checks', async function() {
      it('fails when there is an in flight job', async function() {
        const {jobQueue} = require('../../../../src/services');

        const existingJobs = [
          {jobId: 'existingJobId'}
        ];

        sinon.stub(jobQueue, 'getJobsInFlightForTokenId').returns(Promise.resolve(existingJobs));

        const chainId = 4;
        const res = await chai.request(require('../../../../src'))
            .post(`${getBaseUrl(chainId)}/submit/transfer?key=${API_ACCESS_KEY}`)
            .send({
              "recipient": "0xD677AEd0965AC9B54e709F01A99cEcA205aebC4B",
              "token_type": "TOKENLANDIA",
              "token_id": "99999"
            });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          error: `Duplicate Job found`,
          existingJobs,
        });
      });
    });
  });

  function getBaseUrl(chainId) {
    return `/v1/network/${chainId}/job`;
  }
});
