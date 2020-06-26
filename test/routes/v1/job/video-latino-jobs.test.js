const sinon = require('sinon');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const {JOB_STATUS} = require('../../../../src/services/job/jobConstants');

const API_ACCESS_KEY = process.env.API_ACCESS_KEY;

describe('Job processing route tests (Video Latino)', () => {

  beforeEach(function () {
    this.now = Date.now();
    this.clock = sinon.useFakeTimers(this.now);
  });

  afterEach(function () {
    sinon.restore();
    this.clock.restore();
  });

  describe('create token job', function () {

    describe('validating chain ID', async function () {
      it('fails in invalid chain ID', async function () {
        const invalidChainId = 99;

        const res = await chai.request(require('../../../../src'))
          .post(`${getBaseUrl(invalidChainId)}/submit/createtoken/videolatino`)
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
          .post(`${getBaseUrl(chainId)}/submit/createtoken/videolatino?key=${invalidAPiKey}`)
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
          .post(`${getBaseUrl(chainId)}/submit/createtoken/videolatino?key=${API_ACCESS_KEY}`)
          .send({
            "token_id": 1,
            "coo": "GBR",
            "celebrity_initials": "RSA",
            "name": "token 4",
            "description": "token 4 description",
            "image": "https://ichef.bbci.co.uk/news/320/cpsprodpb/14C0F/production/_110970058_gettyimages-147807964-1.jpg",
            "video_link": "https://ichef.bbci.co.uk/news/320/cpsprodpb/14C0F/production/_110970058_gettyimages-147807964-1.jpg",
            "video_category": "PubliVideos",
            "video_language": "EN",
            "celebrity_name": "Shakira",
            "creation_location": "London",
            "creation_date": "2020-06-24",
            "business_brand": "amazing records"
          });

        res.should.not.be.empty;
        res.status.should.be.equal(400);
        res.body.should.be.deep.equal({
          'error': 'Token already created'
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
          'token_type': 'VIDEO_LATINO'
        });

      res.should.not.be.empty;
      res.status.should.be.equal(200);
      res.body.should.be.deep.equal('success');

      updateStub.called.should.be.true;
      updateStub.args[0].should.be.deep.equal(['4', jobId, 'JOB_CANCELLED', {cancelled: this.now}, 'VIDEO_LATINO']);
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
          'token_type': 'VIDEO_LATINO'
        });

      res.should.not.be.empty;
      res.status.should.be.equal(400);
      res.body.should.be.deep.equal({
        'error': `Unable to cancel VIDEO_LATINO job [${jobId}] on chain [${chainId}] with status [${JOB_STATUS.JOB_CANCELLED}]`
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
          'token_type': 'VIDEO_LATINO'
        });

      res.should.not.be.empty;
      res.status.should.be.equal(400);
      res.body.should.be.deep.equal({
        'error': `Unable to find VIDEO_LATINO job [${jobId}] on chain [${chainId}]`
      });
    });

  });

  function getBaseUrl(chainId) {
    return `/v1/network/${chainId}/job`;
  }
});