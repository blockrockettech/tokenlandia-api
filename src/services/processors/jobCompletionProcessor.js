const _ = require('lodash');

class JobCompletionProcessor {

  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  async processJob(job) {

    // check transaction status
    // update DB
  }
}

module.exports = JobCompletionProcessor;
