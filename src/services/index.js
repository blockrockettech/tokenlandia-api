const TokenLandia = require('./contract/tokenlandia');
const JobQueue = require('./job/jobQueue');
const jobConstants = require('./job/jobConstants');
const jobValidator = require('./job/jobValidator');
const chainUtils = require('../utils/chain');
const IpfsService = require('./ipfs/infura.ipfs.service');

const db = require('./database');

module.exports = {
  newTokenLandiaService: (chainId) => {
    return new TokenLandia(chainId);
  },
  jobQueue: new JobQueue(db),
  jobValidator: jobValidator,
  jobConstants: jobConstants,
  chainUtils: chainUtils,
  ipfsService: new IpfsService()
};
