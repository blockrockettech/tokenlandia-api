const _ = require('lodash');

const processRoutes = require('express').Router({mergeParams: true});

const {
  jobQueue,
  jobConstants,
  newTokenLandiaService,
  newTokenService,
  transactionProcessor,
  metadataCreationProcessor,
  jobCompletionProcessor
} = require('../../../services/index');

const {JOB_STATUS, JOB_TYPES, TOKEN_TYPE} = jobConstants;

const {TRANSACTION_SENT, PRE_PROCESSING_COMPLETE, ACCEPTED} = JOB_STATUS;

/**
 * Process the next available IPFS metadata push
 */
processRoutes.get('/preprocess', async function (req, res) {
  const {chainId} = req.params;

  // Try to get at least 1 job for both token types i.e. tokenlandia and video latino
  const tokenlandiaJobs = await jobQueue.getNextJobForProcessing(
    chainId, [ACCEPTED], TOKEN_TYPE.TOKENLANDIA, 1
  );

  // batch size request for video latino tokens should be upped to 2 as no tokenlandia jobs found
  let nextBatchSize = _.size(tokenlandiaJobs) === 1 ? 1 : 2;

  const videoLatinoJobs = await jobQueue.getNextJobForProcessing(
    chainId, [ACCEPTED], TOKEN_TYPE.VIDEO_LATINO, nextBatchSize
  );

  const jobs = _.filter(_.concat(tokenlandiaJobs, videoLatinoJobs), job => job !== null);

  if (_.size(jobs) === 0) {
    return res
      .status(202)
      .json({
        msg: `No jobs found for processing for chain ID [${chainId}]`
      });
  }

  console.log(`Found [${_.size(jobs)}]  pre-process jobs`);

  const workingJobs = _.map(jobs, (job) => {
    switch (job.jobType) {
      case JOB_TYPES.CREATE_TOKEN:
        return metadataCreationProcessor.pushCreateTokenJob(job);
      case JOB_TYPES.UPDATE_TOKEN:
        // N.B only tokenlandia is applicable for updates
        return metadataCreationProcessor.pushUpdateTokenJob(job, newTokenLandiaService(chainId));
      case JOB_TYPES.TRANSFER_TOKEN:
        // Skip metadata creation for these job types
        return jobQueue.addStatusAndContextToJob(chainId, job.jobId, PRE_PROCESSING_COMPLETE, {}, job.tokenType);
      default:
        console.error('Unknown job type', job);
    }
  });

  const results = await Promise.all(workingJobs);

  return res
    .status(200)
    .json({
      results: _.map(results, (processedJob) => {
        return {
          msg: `Pre-processing job [${processedJob.jobId}]`,
          chainId: chainId,
          tokenId: processedJob.tokenId,
          jobId: processedJob.jobId,
          jobType: processedJob.jobType,
          status: processedJob.status
        };
      })
    });
});

/**
 * Process the next available transaction
 */
processRoutes.get('/transaction', async function (req, res) {
  const {chainId} = req.params;

  function inflightTransactionResponse(jobId) {
    return res
      .status(200)
      .json({
        msg: `Inflight transaction found, waiting for job [${jobId}] to complete`,
      });
  }

  // Clear any inflight jobs
  const inflightTokenlandiaJobs = await jobQueue.getNextJobForProcessing(
    chainId, [TRANSACTION_SENT], TOKEN_TYPE.TOKENLANDIA, 1
  );

  if (inflightTokenlandiaJobs) {
    const inflightTokenlandiaJob = _.first(inflightTokenlandiaJobs);
    const mayBeCompleteJob = await jobCompletionProcessor(chainId).processJob(inflightTokenlandiaJob);

    if (mayBeCompleteJob.status === TRANSACTION_SENT) {
      return inflightTransactionResponse(inflightTokenlandiaJob.jobId);
    }
  }

  const inflightVideoLatinoJobs = await jobQueue.getNextJobForProcessing(
    chainId, [TRANSACTION_SENT], TOKEN_TYPE.VIDEO_LATINO, 1
  );

  if (inflightVideoLatinoJobs) {
    const inflightVideoLatinoJob = _.first(inflightVideoLatinoJobs);
    const mayBeCompleteJob = await jobCompletionProcessor(chainId).processJob(inflightVideoLatinoJob);

    if (mayBeCompleteJob.status === TRANSACTION_SENT) {
      return inflightTransactionResponse(inflightVideoLatinoJob.jobId);
    }
  }

  // If we get to here, try to pick a job that requires a transaction for both token types
  let jobs = await jobQueue.getNextJobForProcessing(
    chainId, [PRE_PROCESSING_COMPLETE], TOKEN_TYPE.TOKENLANDIA, 1
  );

  // no tokenlandia jobs found, try finding a video latino job
  if (!jobs) {
    jobs = await jobQueue.getNextJobForProcessing(
      chainId, [PRE_PROCESSING_COMPLETE], TOKEN_TYPE.VIDEO_LATINO, 1
    );
  }

  // no tokenlandia or video latino jobs, report this back to the caller
  if (!jobs) {
    return res
      .status(200)
      .json({
        msg: `No jobs found for processing for chain ID [${chainId}]`,
      });
  }

  const job = _.first(jobs);
  const tokenService = newTokenService(job.tokenType, chainId);

  const processedJob = await transactionProcessor(chainId, tokenService).processJob(job);

  return res
    .status(200)
    .json({
      msg: `Processing job [${processedJob.jobId}]`,
      chainId: chainId,
      tokenId: processedJob.tokenId,
      jobId: processedJob.jobId,
      status: processedJob.status,
      jobType: processedJob.jobType,
    });
});

/**
 * Process the next available competition job
 */
processRoutes.get('/completions', async function (req, res) {
  const {chainId} = req.params;

  // check to see if theres a tokenlandia job that needs completing
  let jobs = await jobQueue.getNextJobForProcessing(chainId, [TRANSACTION_SENT]);

  // no tokenlandia jobs found, try finding a video latino job
  if (!jobs) {
    jobs = await jobQueue.getNextJobForProcessing(chainId, [TRANSACTION_SENT], TOKEN_TYPE.VIDEO_LATINO, 1);
  }

  // no tokenlandia or video latino jobs, report this back to the caller
  if (!jobs) {
    return res
      .status(200)
      .json({
        msg: `No jobs found for processing for chain ID [${chainId}]`
      });
  }

  const job = _.first(jobs);
  const processedJob = await jobCompletionProcessor(chainId).processJob(job);

  return res
    .status(200)
    .json({
      msg: `Processing job [${processedJob.jobId}]`,
      chainId: chainId,
      tokenId: processedJob.tokenId,
      jobId: processedJob.jobId,
      status: processedJob.status
    });
});

module.exports = processRoutes;
