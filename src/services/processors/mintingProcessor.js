const _ = require('lodash');
const {JOB_STATUS} = require('../job/jobConstants');
const {getEscrowContractAddress} = require('../../utils/truffle');

class MintingProcessor {

  constructor(jobQueue, tokenlandiaService) {
    this.jobQueue = jobQueue;
    this.tokenlandiaService = tokenlandiaService;
  }

  async processJob(job) {

    const {context, tokenId, jobId, chainId} = job;
    console.log(`MintingProcessor - token [${tokenId}] job [${jobId}] on chain [${chainId}]`);

    const {ACCEPTED, METADATA_CREATED} = context;

    const recipient = getEscrowContractAddress(chainId);

    const {
      hash,
      from,
      to,
      nonce,
      gasPrice,
      gasLimit
    } = await this.tokenlandiaService.mint(tokenId, recipient, ACCEPTED.product_code, METADATA_CREATED.metadataHash);

    const newContext = {
      hash,
      from,
      to,
      nonce,
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString(),
      recipient
    };

    // change status to TRANSACTION_SENT and new context including TX hash
    return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.TRANSACTION_SENT, newContext);
  }
}

module.exports = MintingProcessor;
