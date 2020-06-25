const TokenLandia = require('./contract/tokenlandia');
const VideoLatino = require('./contract/videoLatino');
const EscrowContract = require('./contract/escrow');
const JobQueue = require('./job/jobQueue');
const jobConstants = require('./job/jobConstants');
const tokenlandiaJobValidator = require('./job/validation/tokenlandia');
const videoLatinoJobValidator = require('./job/validation/videoLatino');
const generalJobValidator = require('./job/validation/general');
const chainUtils = require('../utils/chain');
const ipfsClient = require('./ipfs/ipfsClient');
const IpfsService = require('./ipfs/infura.ipfs.service');
const {getHttpProvider} = require('../web3/provider');
const gasStation = require('../web3/gasStation.service');

const MetadataCreationProcessor = require('./processors/metadataCreationProcessor');

const TransactionProcessor = require('./processors/transactionProcessor');

const JobCompletionProcessor = require('./processors/jobCompletionProcessor');

const db = require('./database');

const jobQueue = new JobQueue(db);

const ipfsService = new IpfsService(ipfsClient);

const newTokenLandiaService = (chainId) => new TokenLandia(chainId);
const newVideoLatinoService = (chainId) => new VideoLatino(chainId);
const newEscrowService = (chainId) => new EscrowContract(chainId);

module.exports = {
  newTokenLandiaService,
  newVideoLatinoService,
  newEscrowService,
  jobQueue,
  tokenlandiaJobValidator,
  videoLatinoJobValidator,
  generalJobValidator,
  jobConstants,
  chainUtils,
  ipfsService,
  metadataCreationProcessor: new MetadataCreationProcessor(jobQueue, ipfsService),
  transactionProcessor: (chainId, tokenService) => new TransactionProcessor(jobQueue, tokenService, newEscrowService(chainId), gasStation),
  jobCompletionProcessor: (chainId) => new JobCompletionProcessor(getHttpProvider(chainId), jobQueue),
};
