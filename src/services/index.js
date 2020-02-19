const TokenLandia = require('./tokenlandia');
const JobQueue = require('./jobQueue');
const jobConstants = require('./jobConstants');
const jobValidator = require('./jobValidator');
const chainUtils = require('./chainUtils');

const db = require('./database');

module.exports = {
  newTokenLandiaService: (chainId) => {
    return new TokenLandia(chainId);
  },
  jobQueue: new JobQueue(db),
  jobValidator: jobValidator,
  jobConstants: jobConstants,
  chainUtils: chainUtils,
};
