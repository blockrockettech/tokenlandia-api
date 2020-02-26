const _ = require('lodash');
const {getHttpProvider} = require('../../web3/provider');
const {JOB_STATUS} = require('../../services/job/jobConstants');

class JobCompletionProcessor {

  constructor(jobQueue) {
    this.jobQueue = jobQueue;
  }

  async processJob(job) {

    const {context, jobId, chainId} = job;
    console.log(`JobCompletionProcessor - job [${jobId}] on chain [${chainId}]`);

    const {TRANSACTION_SENT} = context;
    const {hash} = TRANSACTION_SENT;

    const provider = getHttpProvider(chainId);

    const receipt = await provider.getTransactionReceipt(hash);
    // console.log(receipt);

    // Only set if the tx is confirmed either way
    const transactionIsConfirmed = receipt && receipt.blockNumber > 0;

    if (transactionIsConfirmed) {

      const {status, to, from, blockHash, blockNumber, confirmations, gasUsed, transactionHash, transactionIndex} = receipt;

      const newContext = {
        status,
        to,
        from,
        blockHash,
        blockNumber,
        confirmations,
        transactionHash,
        transactionIndex,
        gasUsed: gasUsed.toString()
      };

      const jobStatus = receipt.status === 1
        ? JOB_STATUS.JOB_COMPLETE
        : JOB_STATUS.TRANSACTION_FAILED;

      console.log(`Moving job [${jobId}] on chain [${chainId}] to new status of [${jobStatus}]`);
      return this.jobQueue.addStatusAndContextToJob(chainId, jobId, jobStatus, newContext);
    }

    console.log(`Job [${jobId}] on chain [${chainId}] no confirmed yet`);
    return job;
  }

}

module.exports = JobCompletionProcessor;
