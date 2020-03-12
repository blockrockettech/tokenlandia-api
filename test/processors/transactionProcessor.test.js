const _ = require('lodash');
const sinon = require('sinon');

const dotenv = require('dotenv');
dotenv.config({path: `./.env.test`, debug: true});

const {JOB_STATUS, JOB_TYPES} = require('../../src/services/job/jobConstants');

const TransactionProcessor = require('../../src/services/processors/transactionProcessor');

const EscrowContractTruffleConf = require('../../src/truffleconf/escrow/TrustedNftEscrow');

describe('Transaction Processor', async function () {

  beforeEach(function () {
    this.now = Date.now();
    this.clock = sinon.useFakeTimers(this.now);
  });

  afterEach(function () {
    sinon.restore();
    this.clock.restore();
  });

  describe('Processing transactions for CREATE_TOKEN job type', () => {
    it('Correctly fires a mint transaction', async () => {
      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves('success')
      };

      const mockMintResponse = {
        hash: 'fff',
        from: '0x0',
        to: '0x456',
        nonce: 1,
        gasPrice: 5,
        gasLimit: 10
      };

      const tokenlandiaService = {
        mint: sinon.stub().onCall(0).resolves(mockMintResponse),
      };

      const gasStation = {
        isWithinGasThreshold: sinon.stub().onCall(0).resolves(true),
      };

      const chainId = 4;
      const jobId = 'abc-123-def-456';
      const tokenId = 1;
      const job = {
        chainId,
        jobId,
        tokenId,
        jobType: JOB_TYPES.CREATE_TOKEN,
        context: {
          [JOB_STATUS.ACCEPTED]: {
            'token_id': 1,
            'coo': 'USA',
            'artist_initials': 'RSA',
            'series': '002',
            'design': '0003',
            'name': 'token 1',
            'description': 'token 1 description',
            'image': '',
            'artist': 'artist',
            'artist_assistant': 'assistant',
            'brand': 'brand',
            'model': 'model',
            'type': 'PHYSICAL_ASSET',
            'product_id': 'USA-RSA-002-0003-113',
            'product_code': 'USA-RSA-002-0003'
          },
          [JOB_STATUS.PRE_PROCESSING_COMPLETE]: {
            metadataHash: 'QmPPi7piLxpzhcPUX6LSSEBRttS5VSn2AgMAiUtjn5Run9',
            metadata: {
              attributes: {
                artist: 'artist',
                artist_assistant: 'assistant',
                artist_initials: 'RSA',
                brand: 'brand',
                coo: 'USA',
                design: '0003',
                model: 'model',
                product_id: 'USA-RSA-002-0003-113',
                series: '002',
                token_id: 1
              },
              created: Math.floor(this.now / 1000),
              description: 'token 1 description',
              image: 'https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf',
              name: 'token 1',
              type: 'PHYSICAL_ASSET'
            }
          }
        }
      };

      const transactionProcessor = new TransactionProcessor(jobQueue, tokenlandiaService, null, gasStation);
      const result = await transactionProcessor.processJob(job);

      result.should.be.deep.equal('success');

      const recipient = EscrowContractTruffleConf.networks[chainId.toString()].address;
      sinon.assert.calledWith(tokenlandiaService.mint, tokenId, recipient, job.context[JOB_STATUS.ACCEPTED].product_code, job.context[JOB_STATUS.PRE_PROCESSING_COMPLETE].metadataHash);

      sinon.assert.calledWith(jobQueue.addStatusAndContextToJob, chainId, jobId, JOB_STATUS.TRANSACTION_SENT, {
        ...mockMintResponse,
        gasPrice: mockMintResponse.gasPrice.toString(),
        gasLimit: mockMintResponse.gasLimit.toString(),
        recipient
      });
    });
  });

  describe('Processing transactions for UPDATE_TOKEN job type', () => {
    it('Correctly fires an update transaction', async () => {
      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves('success')
      };

      const mockUpdateIpfsHashResponse = {
        hash: 'fff',
        from: '0x0',
        to: '0x456',
        nonce: 1,
        gasPrice: 5,
        gasLimit: 10
      };

      const tokenlandiaService = {
        updateIpfsHash: sinon.stub().onCall(0).resolves(mockUpdateIpfsHashResponse),
      };

      const gasStation = {
        isWithinGasThreshold: sinon.stub().onCall(0).resolves(true),
      };

      const chainId = 4;
      const jobId = 'abc-123-def-456';
      const tokenId = 1;
      const job = {
        chainId,
        jobId,
        tokenId,
        jobType: JOB_TYPES.UPDATE_TOKEN,
        context: {
          [JOB_STATUS.ACCEPTED]: {
            'token_id': 1,
            'coo': 'USA',
            'artist_initials': 'RSA',
            'series': '002',
            'design': '0003',
            'name': 'token 1',
            'description': 'token 1 description',
            'image': '',
            'artist': 'artist',
            'artist_assistant': 'assistant',
            'brand': 'brand',
            'model': 'model',
            'type': 'PHYSICAL_ASSET',
            'product_id': 'USA-RSA-002-0003-113',
            'product_code': 'USA-RSA-002-0003'
          },
          [JOB_STATUS.PRE_PROCESSING_COMPLETE]: {
            metadataHash: 'QmPPi7piLxpzhcPUX6LSSEBRttS5VSn2AgMAiUtjn5Run9',
            metadata: {
              attributes: {
                artist: 'artist',
                artist_assistant: 'assistant',
                artist_initials: 'RSA',
                brand: 'brand',
                coo: 'USA',
                design: '0003',
                model: 'model',
                product_id: 'USA-RSA-002-0003-113',
                series: '002',
                token_id: 1
              },
              created: Math.floor(this.now / 1000),
              description: 'token 1 description',
              image: 'https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf',
              name: 'token 1',
              type: 'PHYSICAL_ASSET'
            }
          }
        }
      };

      const transactionProcessor = new TransactionProcessor(jobQueue, tokenlandiaService, null, gasStation);
      const result = await transactionProcessor.processJob(job);

      result.should.be.deep.equal('success');

      const metadataHash = job.context[JOB_STATUS.PRE_PROCESSING_COMPLETE].metadataHash;
      sinon.assert.calledWith(tokenlandiaService.updateIpfsHash, tokenId, metadataHash);

      sinon.assert.calledWith(jobQueue.addStatusAndContextToJob, chainId, jobId, JOB_STATUS.TRANSACTION_SENT, {
        ...mockUpdateIpfsHashResponse,
        gasPrice: mockUpdateIpfsHashResponse.gasPrice.toString(),
        gasLimit: mockUpdateIpfsHashResponse.gasLimit.toString(),
        metadataHash
      });
    });
  });

  describe('Invalid job type', () => {
    it('Moves job into TX failed status', async () => {
      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves('success')
      };

      const gasStation = {
        isWithinGasThreshold: sinon.stub().onCall(0).resolves(true),
      };

      const chainId = 4;
      const jobId = 'abc-123-def-456';
      const tokenId = 1;
      const job = {
        chainId,
        jobId,
        tokenId,
        jobType: null,
        context: {
          [JOB_STATUS.ACCEPTED]: {
            'token_id': 1,
            'coo': 'USA',
            'artist_initials': 'RSA',
            'series': '002',
            'design': '0003',
            'name': 'token 1',
            'description': 'token 1 description',
            'image': '',
            'artist': 'artist',
            'artist_assistant': 'assistant',
            'brand': 'brand',
            'model': 'model',
            'type': 'PHYSICAL_ASSET',
            'product_id': 'USA-RSA-002-0003-113',
            'product_code': 'USA-RSA-002-0003'
          },
          [JOB_STATUS.PRE_PROCESSING_COMPLETE]: {
            metadataHash: 'QmPPi7piLxpzhcPUX6LSSEBRttS5VSn2AgMAiUtjn5Run9',
            metadata: {
              attributes: {
                artist: 'artist',
                artist_assistant: 'assistant',
                artist_initials: 'RSA',
                brand: 'brand',
                coo: 'USA',
                design: '0003',
                model: 'model',
                product_id: 'USA-RSA-002-0003-113',
                series: '002',
                token_id: 1
              },
              created: Math.floor(this.now / 1000),
              description: 'token 1 description',
              image: 'https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf',
              name: 'token 1',
              type: 'PHYSICAL_ASSET'
            }
          }
        }
      };

      const transactionProcessor = new TransactionProcessor(jobQueue, null, null, gasStation);
      const result = await transactionProcessor.processJob(job);

      result.should.be.deep.equal('success');

      sinon.assert.calledWith(jobQueue.addStatusAndContextToJob, chainId, jobId, JOB_STATUS.TRANSACTION_FAILED, 'Unknown job type [null]');
    });
  });

  describe('Skips jobs when to high', () => {
    it('Returns same job with no state when threshold exceeded', async () => {
      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves('success')
      };

      const gasStation = {
        isWithinGasThreshold: sinon.stub().onCall(0).resolves(false),
      };

      const chainId = 4;
      const jobId = 'abc-123-def-456';
      const tokenId = 1;
      const job = {
        chainId,
        jobId,
        tokenId,
        jobType: null,
        context: {
          [JOB_STATUS.ACCEPTED]: {
            'token_id': 1,
            'coo': 'USA',
            'artist_initials': 'RSA',
            'series': '002',
            'design': '0003',
            'name': 'token 1',
            'description': 'token 1 description',
            'image': '',
            'artist': 'artist',
            'artist_assistant': 'assistant',
            'brand': 'brand',
            'model': 'model',
            'type': 'PHYSICAL_ASSET',
            'product_id': 'USA-RSA-002-0003-113',
            'product_code': 'USA-RSA-002-0003'
          },
        }
      };

      const transactionProcessor = new TransactionProcessor(jobQueue, null, null, gasStation);
      const result = await transactionProcessor.processJob(job);
      result.should.be.deep.equal(job);

      // No state change
      jobQueue.addStatusAndContextToJob.called.should.be.eq(false);
    });
  });

});
