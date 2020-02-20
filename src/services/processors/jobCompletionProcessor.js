const _ = require('lodash');

class JobCompletionProcessor {

  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  async processJob(job) {

    const {context, tokenId, jobId, chainId} = job;
    const {TRANSACTION_SENT} = context;
    const {tx} = TRANSACTION_SENT;

    // check transaction status
    // update DB
  }

}

module.exports = JobCompletionProcessor;
