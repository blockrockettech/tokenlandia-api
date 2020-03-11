const _ = require('lodash');
const sinon = require('sinon');

const dotenv = require('dotenv');
dotenv.config({path: `./.env.test`, debug: true});

const {JOB_STATUS} = require('../../src/services/job/jobConstants');

const JobCompletionProcessor = require('../../src/services/processors/jobCompletionProcessor');

describe('Job Completion Processor', async function () {

  beforeEach(function () {
    this.now = Date.now();
    this.clock = sinon.useFakeTimers(this.now);
  });

  afterEach(function () {
    sinon.restore();
    this.clock.restore();
  });

  describe('Completing a job', async function () {

    it('Should get receipt and find completed', async function () {

      const provider = {
        getTransactionReceipt: sinon.stub().onCall(0).resolves({
          blockNumber: 120,
          status: 1, // SUCCESS
          gasUsed: 10000,
          blockHash: 'blockHash',
          confirmations: 'confirmations',
          from: 'from',
          to: 'to',
          transactionHash: 'transactionHash',
          transactionIndex: 'transactionIndex',
        })
      };

      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves(),
      };

      const process = new JobCompletionProcessor(provider, jobQueue);

      const chainId = 4;
      const jobId = 'abc-123-def-456';

      const job = {
        chainId: chainId,
        jobId: jobId,
        context: {
          [JOB_STATUS.TRANSACTION_SENT]: {
            hash: '0xf4b839e246e740bc8137eb823b3bf69a694d9a8efe1defdc4631c46c2cbb9756'
          }
        }
      };

      await process.processJob(job);

      sinon.assert.calledWith(jobQueue.addStatusAndContextToJob, 4, 'abc-123-def-456', 'JOB_COMPLETE', {
        blockHash: 'blockHash',
        blockNumber: 120,
        confirmations: 'confirmations',
        from: 'from',
        gasUsed: '10000',
        status: 1,
        to: 'to',
        transactionHash: 'transactionHash',
        transactionIndex: 'transactionIndex'
      });

    });

    it('Should get receipt and find failure', async function () {

      const provider = {
        getTransactionReceipt: sinon.stub().onCall(0).resolves({
          blockNumber: 120,
          status: 0, // FAILED
          gasUsed: 10000,
          blockHash: 'blockHash',
          confirmations: 'confirmations',
          from: 'from',
          to: 'to',
          transactionHash: 'transactionHash',
          transactionIndex: 'transactionIndex',
        })
      };

      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves(),
      };

      const process = new JobCompletionProcessor(provider, jobQueue);

      const chainId = 4;
      const jobId = 'abc-123-def-456';

      const job = {
        chainId: chainId,
        jobId: jobId,
        context: {
          [JOB_STATUS.TRANSACTION_SENT]: {
            hash: '0xf4b839e246e740bc8137eb823b3bf69a694d9a8efe1defdc4631c46c2cbb9756'
          }
        }
      };

      await process.processJob(job);

      sinon.assert.calledWith(jobQueue.addStatusAndContextToJob, 4, 'abc-123-def-456', 'TRANSACTION_FAILED', {
        blockHash: 'blockHash',
        blockNumber: 120,
        confirmations: 'confirmations',
        from: 'from',
        gasUsed: '10000',
        status: 0,
        to: 'to',
        transactionHash: 'transactionHash',
        transactionIndex: 'transactionIndex'
      });
    });

    it('Should get receipt and find not confirmed', async function () {

      const provider = {
        getTransactionReceipt: sinon.stub().onCall(0).resolves({
          status: 0, // not confirmation
        })
      };

      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves({}),
      };

      const process = new JobCompletionProcessor(provider, jobQueue);

      const chainId = 4;
      const jobId = 'abc-123-def-456';

      const job = {
        chainId: chainId,
        jobId: jobId,
        context: {
          [JOB_STATUS.TRANSACTION_SENT]: {
            hash: '0xf4b839e246e740bc8137eb823b3bf69a694d9a8efe1defdc4631c46c2cbb9756'
          }
        }
      };

      const results = await process.processJob(job);

      // no change - return current job
      results.should.be.deep.eq(job);

      // No state change
      jobQueue.addStatusAndContextToJob.called.should.be.eq(false);
    });

  });

});
