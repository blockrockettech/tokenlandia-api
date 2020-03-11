const _ = require('lodash');
const sinon = require('sinon');

const dotenv = require('dotenv');
dotenv.config({path: `./.env.test`, debug: true});

const {JOB_STATUS} = require('../../src/services/job/jobConstants');

const TransactionProcessor = require('../../src/services/processors/transactionProcessor');

const {
  givenAJobQueue,
  givenATokenlandiaService,
} = require('processorTestHelper');

describe.only('Transaction Processor - ', async function () {

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

      const chainId = 4;
      const jobId = 'abc-123-def-456';
      const job = {
        chainId,
        jobId,
        context: {
          [JOB_STATUS.METADATA_CREATED]: {
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

      const transactionProcessor = new TransactionProcessor(jobQueue, tokenlandiaService);

    });
  });

});
