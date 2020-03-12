const _ = require('lodash');
const {JOB_STATUS, JOB_TYPES} = require('../job/jobConstants');
const {getEscrowContractAddress} = require('../../utils/truffle');

class TransactionProcessor {

  constructor(jobQueue, tokenlandiaService, escrowService) {
    this.jobQueue = jobQueue;
    this.tokenlandiaService = tokenlandiaService;
    this.escrowService = escrowService;
  }

  async processJob(job) {

    const {context, tokenId, jobId, chainId, jobType} = job;
    console.log(`TransactionProcessor - token [${tokenId}] job [${jobId}] on chain [${chainId}]`);

    const {ACCEPTED, PRE_PROCESSING_COMPLETE} = context;

    try {

      const sendTransaction = async () => {
        switch (jobType) {
          case JOB_TYPES.CREATE_TOKEN:
            return this._mintNewToken(chainId, tokenId, ACCEPTED.product_code, PRE_PROCESSING_COMPLETE.metadataHash);
          case JOB_TYPES.UPDATE_TOKEN:
            return this._updateTokenMetaData(tokenId, PRE_PROCESSING_COMPLETE.metadataHash);
          case JOB_TYPES.TRANSFER_TOKEN:
            return this._transferToken(tokenId, ACCEPTED.recipient);
          default:
            throw new Error(`Unknown job type [${jobType}]`);
        }
      };

      const newContext = await sendTransaction();

      console.log(`Transaction sent for job [${jobId}] on chain [${chainId}] for token [${tokenId}]`, newContext.hash);

      // change status to TRANSACTION_SENT and new context including TX hash
      return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.TRANSACTION_SENT, newContext);

    } catch (e) {
      console.error(`Failed to send transaction...`, e);
      return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.TRANSACTION_FAILED, e.message);
    }
  }

  async _mintNewToken(chainId, tokenId, product_code, metadataHash) {
    const recipient = getEscrowContractAddress(chainId);

    const {hash, from, to, nonce, gasPrice, gasLimit} = await this.tokenlandiaService.mint(tokenId, recipient, product_code, metadataHash);

    return {
      hash,
      from,
      to,
      nonce,
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString(),
      recipient
    };
  }

  async _updateTokenMetaData(tokenId, metadataHash) {
    const {hash, from, to, nonce, gasPrice, gasLimit} = await this.tokenlandiaService.updateIpfsHash(tokenId, metadataHash);

    return {
      hash,
      from,
      to,
      nonce,
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString(),
      metadataHash
    };
  }

  async _transferToken(tokenId, recipient) {
    const {hash, from, to, nonce, gasPrice, gasLimit} = await this.escrowService.transferOwnership(tokenId, recipient);

    return {
      hash,
      from,
      to,
      nonce,
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString(),
      recipient
    };
  }
}

module.exports = TransactionProcessor;
