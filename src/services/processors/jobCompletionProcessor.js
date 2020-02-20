const _ = require('lodash');
const {getHttpProvider} = require('../../web3/provider');

class JobCompletionProcessor {

  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  async processJob(job) {

    const {context, tokenId, jobId, chainId} = job;
    const {TRANSACTION_SENT} = context;
    const {transactionHash} = TRANSACTION_SENT;

    // check transaction status
    // update DB

    const provider = getHttpProvider(chainId);

    const receipt = await provider.getTransactionReceipt(transactionHash);

    console.log(receipt);

  }

}

module.exports = JobCompletionProcessor;
