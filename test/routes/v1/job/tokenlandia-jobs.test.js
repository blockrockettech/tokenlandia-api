const sinon = require('sinon');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const {JOB_STATUS, JOB_TYPES, TOKEN_TYPE} = require('../../../../src/services/job/jobConstants');

const API_ACCESS_KEY = process.env.API_ACCESS_KEY;

describe('Job processing route tests (Tokenlandia)', () => {

  beforeEach(function () {
    this.now = Date.now();
    this.clock = sinon.useFakeTimers(this.now);
  });

  afterEach(function () {
    sinon.restore();
    this.clock.restore();
  });

  describe('create token job', function () {

    it('successfully adds the create token job', async () => {
      const {jobQueue} = require('../../../../src/services');

      sinon.stub(jobQueue, 'getJobsForTokenId').returns(Promise.resolve(null));

      const chainId = '4';
      const createJobData = {
        'token_id': 99999,
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
      };

      const product_code = `${createJobData.coo}-${createJobData.artist_initials}-${createJobData.series}-${createJobData.design}`;
      const enhancedJobData = {
        ...createJobData,
        type: 'GENERAL_ASSET',
        product_id: `${product_code}-${createJobData.token_id}`,
        product_code
      };

      const finalJobData = {
        chainId,
        tokenId: createJobData.token_id.toString(),
        status: JOB_STATUS.ACCEPTED,
        jobType: JOB_TYPES.CREATE_TOKEN,
        tokenType: TOKEN_TYPE.TOKENLANDIA,
        createdDate: Date.now(),

        // The actual payload
        context: {
          [JOB_STATUS.ACCEPTED]: {
            ...enhancedJobData
          }
        }
      };

      sinon.stub(jobQueue, 'addJobToQueue').callsFake((chain, jobType, jobData, tokenType) => {
        chain.should.be.equal(chainId);
        jobType.should.be.equal(JOB_TYPES.CREATE_TOKEN);
        jobData.should.be.deep.equal(enhancedJobData);

        return finalJobData;
      });

      const res = await chai.request(require('../../../../src'))
          .post(`${getBaseUrl(chainId)}/submit/createtoken/general?key=${API_ACCESS_KEY}`)
          .send(createJobData);

      res.should.not.be.empty;
      res.status.should.be.equal(202);
      res.body.should.be.deep.equal(finalJobData);
    });

    describe('validating chain ID', async function () {
      it('fails in invalid chain ID', async function () {
        const invalidChainId = 99;

        const res = await chai.request(require('../../../../src'))
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

        const res = await chai.request(require('../../../../src'))
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

        const res = await chai.request(require('../../../../src'))
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

        const res = await chai.request(require('../../../../src'))
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

        const res = await chai.request(require('../../../../src'))
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

        const res = await chai.request(require('../../../../src'))
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

  describe('cancelling a job', async function () {

    it('will cancel job when in the correct state', async function () {
      const chainId = 4;
      const jobId = `1234`;
      const {jobQueue} = require('../../../../src/services');

      sinon.stub(jobQueue, 'getJobForId').returns({
        jobId: jobId,
        status: JOB_STATUS.ACCEPTED
      });

      const updateStub = sinon.stub(jobQueue, 'addStatusAndContextToJob').returns('success');

      const res = await chai.request(require('../../../../src'))
        .delete(`${getBaseUrl(chainId)}/cancel?key=${API_ACCESS_KEY}`)
        .send({
          'job_id': jobId,
          'token_type': 'TOKENLANDIA'
        });

      res.should.not.be.empty;
      res.status.should.be.equal(200);
      res.body.should.be.deep.equal('success');

      updateStub.called.should.be.true;
      updateStub.args[0].should.be.deep.equal(['4', jobId, 'JOB_CANCELLED', {cancelled: this.now}, 'TOKENLANDIA']);
    });

    it('will reject change when in the correct state', async function () {
      const chainId = 4;
      const jobId = `1234`;
      const {jobQueue} = require('../../../../src/services');

      sinon.stub(jobQueue, 'getJobForId').returns({
        status: JOB_STATUS.JOB_CANCELLED
      });

      const res = await chai.request(require('../../../../src'))
        .delete(`${getBaseUrl(chainId)}/cancel?key=${API_ACCESS_KEY}`)
        .send({
          'job_id': jobId,
          'token_type': 'TOKENLANDIA'
        });

      res.should.not.be.empty;
      res.status.should.be.equal(400);
      res.body.should.be.deep.equal({
        'error': `Unable to cancel TOKENLANDIA job [${jobId}] on chain [${chainId}] with status [${JOB_STATUS.JOB_CANCELLED}]`
      });
    });

    it('will reject change when job does not exist', async function () {
      const chainId = 4;
      const jobId = `1234`;

      const {jobQueue} = require('../../../../src/services');

      sinon.stub(jobQueue, 'getJobForId').returns(null);

      const res = await chai.request(require('../../../../src'))
        .delete(`${getBaseUrl(chainId)}/cancel?key=${API_ACCESS_KEY}`)
        .send({
          'job_id': jobId,
          'token_type': 'TOKENLANDIA'
        });

      res.should.not.be.empty;
      res.status.should.be.equal(400);
      res.body.should.be.deep.equal({
        'error': `Unable to find TOKENLANDIA job [${jobId}] on chain [${chainId}]`
      });
    });

  });

  function getBaseUrl(chainId) {
    return `/v1/network/${chainId}/job`;
  }
});
