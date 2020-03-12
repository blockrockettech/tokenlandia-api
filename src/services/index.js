const TokenLandia = require('./contract/tokenlandia');
const EscrowContract = require('./contract/escrow');
const JobQueue = require('./job/jobQueue');
const jobConstants = require('./job/jobConstants');
const jobValidator = require('./job/jobValidator');
const chainUtils = require('../utils/chain');
const ipfsClient = require('./ipfs/ipfsClient');
const IpfsService = require('./ipfs/infura.ipfs.service');
const {getHttpProvider} = require('../web3/provider');

const MetadataCreationProcessor = require('./processors/metadataCreationProcessor');

const TransactionProcessor = require('./processors/transactionProcessor');

const JobCompletionProcessor = require('./processors/jobCompletionProcessor');

const db = require('./database');

const jobQueue = new JobQueue(db);

const ipfsService = new IpfsService(ipfsClient);

module.exports = {
  newTokenLandiaService: (chainId) => new TokenLandia(chainId),
  newEscrowService: (chainId) => new EscrowContract(chainId),
  jobQueue: jobQueue,
  jobValidator: jobValidator,
  jobConstants: jobConstants,
  chainUtils: chainUtils,
  ipfsService: ipfsService,
  metadataCreationProcessor: new MetadataCreationProcessor(jobQueue, ipfsService),
  transactionProcessor: (chainId) => new TransactionProcessor(jobQueue, new TokenLandia(chainId)),
  jobCompletionProcessor: (chainId) => new JobCompletionProcessor(getHttpProvider(chainId), jobQueue),
};
