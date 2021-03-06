const _ = require('lodash');
const {JOB_STATUS, JOB_TYPES} = require('../job/jobConstants');
const {getEscrowContractAddress} = require('../../utils/truffle');

class TransactionProcessor {

  constructor(jobQueue, tokenService, escrowService, gasStation) {
    this.jobQueue = jobQueue;
    this.tokenService = tokenService;
    this.escrowService = escrowService;
    this.gasStation = gasStation;
  }

  async processJob(job) {

    const {context, tokenId, jobId, chainId, jobType, tokenType} = job;
    console.log(`TransactionProcessor - ${tokenType} token [${tokenId}] job [${jobId}] on chain [${chainId}]`);

    const exceedsGasLimit = !(await this.gasStation.isWithinGasThreshold(chainId));
    if (exceedsGasLimit) {
      console.error('Skipping job as GAS exceeds limit');
      return job;
    }

    const {ACCEPTED, PRE_PROCESSING_COMPLETE} = context;

    try {

      const sendTransaction = async () => {
        switch (jobType) {
          case JOB_TYPES.CREATE_TOKEN:
            return this._mintNewToken(chainId, tokenId, ACCEPTED.product_code, PRE_PROCESSING_COMPLETE.metadataHash);
          case JOB_TYPES.UPDATE_TOKEN:
            return this._updateTokenMetaData(tokenId, PRE_PROCESSING_COMPLETE.metadataHash);
          case JOB_TYPES.TRANSFER_TOKEN:
            return this._transferToken(tokenId, ACCEPTED.recipient, tokenType);
          default:
            throw new Error(`Unknown job type [${jobType}]`);
        }
      };

      const newContext = await sendTransaction();

      console.log(`Transaction sent for ${tokenType} job [${jobId}] on chain [${chainId}] for token [${tokenId}]`, newContext.hash);

      // change status to TRANSACTION_SENT and new context including TX hash
      return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.TRANSACTION_SENT, newContext, tokenType);

    } catch (e) {
      console.error(`Failed to send transaction...`, e);
      return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.TRANSACTION_FAILED, e.message, tokenType);
    }
  }

  async _mintNewToken(chainId, tokenId, product_code, metadataHash) {
    const recipient = getEscrowContractAddress(chainId);

    const {hash, from, to, nonce, gasPrice, gasLimit} = await this.tokenService.mint(tokenId, recipient, product_code, metadataHash);

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
    const {hash, from, to, nonce, gasPrice, gasLimit} = await this.tokenService.updateIpfsHash(tokenId, metadataHash);

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

  async _transferToken(tokenId, recipient, tokenType) {
    const {hash, from, to, nonce, gasPrice, gasLimit} = await this.escrowService.transferOwnership(tokenId, recipient, tokenType);

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
