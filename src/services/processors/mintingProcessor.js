const _ = require('lodash');
const {JOB_STATUS} = require('../job/jobConstants');
const {getEscrowContractAddress} = require('../../utils/truffle');

class MintingProcessor {

  constructor(jobQueue, tokenlandiaService) {
    this.jobQueue = jobQueue;
    this.tokenlandiaService = tokenlandiaService;
  }

  async processJob(job) {
    // get context from previous status - ACCEPTED and METADATA_CREATED
    const {context, tokenId, jobId, chainId} = job;
    const {ACCEPTED, METADATA_CREATED} = context;

    // prep minting params
    const recipient = getEscrowContractAddress(chainId);

    // fire TX
    const tx = await this.tokenlandiaService.mint(tokenId, recipient, ACCEPTED.product_code, METADATA_CREATED.metadataHash);

    const newContext = {
      tx,
      // TxHash
      // Gas Price
      // Gas Sent
      // Nonce
      recipient
    };

    // change status to TRANSACTION_SENT and new context including TX hash
    await this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.TRANSACTION_SENT, newContext);
  }
}

module.exports = MintingProcessor;
