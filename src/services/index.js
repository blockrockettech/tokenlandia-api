const TokenLandia = require('./contract/tokenlandia');
const JobQueue = require('./job/jobQueue');
const jobConstants = require('./job/jobConstants');
const jobValidator = require('./job/jobValidator');
const chainUtils = require('../utils/chain');
const ipfsClient = require('./ipfs/ipfsClient');
const IpfsService = require('./ipfs/infura.ipfs.service');

const MetadataCreationProcessor = require('./processors/metadataCreationProcessor');

const MintingProcessor = require('./processors/mintingProcessor');

const JobCompletionProcessor = require('./processors/jobCompletionProcessor');

const db = require('./database');

const jobQueue = new JobQueue(db);

const ipfsService = new IpfsService(ipfsClient);

module.exports = {
  newTokenLandiaService: chainId => new TokenLandia(chainId),
  jobQueue: jobQueue,
  jobValidator: jobValidator,
  jobConstants: jobConstants,
  chainUtils: chainUtils,
  ipfsService: ipfsService,
  metadataCreationProcessor: new MetadataCreationProcessor(jobQueue, ipfsService),
  mintingProcessor: (chainId) => new MintingProcessor(jobQueue, new TokenLandia(chainId)),
  jobCompletionProcessor: new JobCompletionProcessor(jobQueue),
};
