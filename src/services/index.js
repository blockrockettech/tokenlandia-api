const TokenLandia = require('./contract/tokenlandia');
const JobQueue = require('./job/jobQueue');
const jobConstants = require('./job/jobConstants');
const jobValidator = require('./job/jobValidator');
const chainUtils = require('../utils/chain');
const ipfsClient = require('./ipfs/ipfsClient');
const IpfsService = require('./ipfs/infura.ipfs.service');
const MetadataCreationJob = require('./processors/metadataCreationJob');

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
  metadataCreationJob: new MetadataCreationJob(jobQueue, ipfsService),
};
