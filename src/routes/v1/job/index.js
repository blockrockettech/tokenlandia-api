const _ = require('lodash');
const {isValidAddress} = require('../../../services/contract/utils');

const job = require('express').Router({mergeParams: true});

const {
  jobQueue,
  tokenlandiaJobValidator,
  videoLatinoJobValidator,
  jobConstants,
  newTokenLandiaService,
  newVideoLatinoService,
  newEscrowService,
  transactionProcessor,
  metadataCreationProcessor,
  jobCompletionProcessor
} = require('../../../services/index');

const {JOB_STATUS, JOB_TYPES, TOKEN_TYPE, canCancelJob} = jobConstants;

/**
 * Submit a new Job to create a new Tokenlandia token
 */
job.post('/submit/createtoken/general', async function (req, res) {

  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await tokenlandiaJobValidator.isValidCreateTokenJob(rawJobData);
  if (!valid) {
    console.error(`Errors found in job`, errors);
    return res.status(400).json({
      error: `Invalid job data`,
      details: errors
    });
  }

  console.log(`Incoming tokenlandia create job found to be valid for chainId [${chainId}]`);

  const {token_id} = rawJobData;

  const tokenLandiaService = newTokenLandiaService(chainId);
  const tokenExists = await tokenLandiaService.tokenExists(token_id);
  if (tokenExists) {
    console.error(`Incoming job - token exists [${tokenExists}] for tokenId [${token_id}] and chainId [${chainId}]`);
    return res.status(400).json({
      error: `Token already created`,
    });
  }

  const existingJob = await jobQueue.getJobsForTokenId(chainId, token_id, JOB_TYPES.CREATE_TOKEN);
  if (existingJob) {
    console.error(`Incoming job - existing job found for tokenId [${token_id}] and chainId [${chainId}] and job [${JOB_TYPES.CREATE_TOKEN}]`);
    return res.status(400).json({
      error: `Duplicate Job found`,
      existingJob
    });
  }

  const {coo, artist_initials, series, design} = rawJobData;
  const product_code = `${coo}-${artist_initials}-${series}-${design}`;

  // Build full job data from composite properties
  const jobData = {
    ...rawJobData,
    type: 'GENERAL_ASSET',
    product_id: `${product_code}-${token_id}`,
    product_code
  };

  // accept job
  const jobDetails = await jobQueue.addJobToQueue(chainId, JOB_TYPES.CREATE_TOKEN, jobData);
  console.log(`Job [${JOB_TYPES.CREATE_TOKEN}] created tokenId [${token_id}] and chainId [${chainId}]`);

  // return job details
  return res
    .status(202)
    .json(jobDetails);
});

/**
 * Submit a new Job to create a new Video Latino token
 */
job.post('/submit/createtoken/videolatino', async function (req, res) {

  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await videoLatinoJobValidator.isValidCreateTokenJob(rawJobData);
  if (!valid) {
    console.error(`Errors found in job`, errors);
    return res.status(400).json({
      error: `Invalid job data`,
      details: errors
    });
  }

  console.log(`Incoming videolatino create job found to be valid for chainId [${chainId}]`);

  const {token_id} = rawJobData;

  const videoLatinoService = newVideoLatinoService(chainId);
  const tokenExists = await videoLatinoService.tokenExists(token_id);
  if (tokenExists) {
    console.error(`Incoming videolatino create job - token exists [${tokenExists}] for tokenId [${token_id}] and chainId [${chainId}]`);
    return res.status(400).json({
      error: `Token already created`,
    });
  }

  const existingJob = await jobQueue.getJobsForTokenId(chainId, token_id, JOB_TYPES.CREATE_TOKEN, TOKEN_TYPE.VIDEO_LATINO);
  if (existingJob) {
    console.error(`Incoming videolatino create job - existing job found for tokenId [${token_id}] and chainId [${chainId}] and job [${JOB_TYPES.CREATE_TOKEN}]`);
    return res.status(400).json({
      error: `Duplicate Job found`,
      existingJob
    });
  }

  const {coo, celebrity_initials} = rawJobData;
  const product_code = `${coo}-${celebrity_initials}`;

  // Build full job data from composite properties
  const jobData = {
    ...rawJobData,
    type: 'VIDEO_LATINO',
    product_id: `${product_code}-${token_id}`, // product ID == video ID i.e unique identifier
    product_code
  };

  // accept job
  const jobDetails = await jobQueue.addJobToQueue(chainId, JOB_TYPES.CREATE_TOKEN, jobData, TOKEN_TYPE.VIDEO_LATINO);
  console.log(`Video latino job [${JOB_TYPES.CREATE_TOKEN}] created tokenId [${token_id}] and chainId [${chainId}]`);

  // return job details
  return res
      .status(202)
      .json(jobDetails);
});

/**
 * Submit a new Job to update a new Tokenlandia token
 */
job.post('/submit/updatetoken/general', async function (req, res) {

  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await tokenlandiaJobValidator.isValidUpdateTokenJob(rawJobData);
  console.log(`Incoming update job found to be valid [${valid}] for chainId [${chainId}]`);

  if (!valid) {
    console.error(`Errors found in update job`, errors);
    return res.status(400).json({
      error: `Invalid job data`,
      details: errors
    });
  }

  const {token_id} = rawJobData;

  const tokenLandiaService = newTokenLandiaService(chainId);
  const tokenExists = await tokenLandiaService.tokenExists(token_id);
  if (!tokenExists) {
    console.error(`Incoming update job - token does not exists [${tokenExists}] for tokenId [${token_id}] and chainId [${chainId}]`);
    return res.status(400).json({
      error: `Token does not exist`,
    });
  }

  const existingJobs = await jobQueue.getJobsInFlightForTokenId(chainId, token_id, JOB_TYPES.UPDATE_TOKEN);
  if (existingJobs) {
    console.warn(`Incoming job - existing job found for tokenId [${token_id}] and chainId [${chainId}] and job [${JOB_TYPES.UPDATE_TOKEN}]`);
  }

  // Build full job data from composite properties
  const jobData = {
    ...rawJobData,
    type: 'GENERAL_ASSET',
  };

  // Accept job
  const jobDetails = await jobQueue.addJobToQueue(chainId, JOB_TYPES.UPDATE_TOKEN, jobData);
  console.log(`Job [${JOB_TYPES.UPDATE_TOKEN}] created tokenId [${token_id}] and chainId [${chainId}]`);

  // return job details
  return res
    .status(202)
    .json(jobDetails);
});

/**
 * Submit a new Job to transfer a Tokenlandia token
 */
job.post('/submit/transfer', async function (req, res) {
  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await tokenlandiaJobValidator.isValidTransferTokenJob(rawJobData);
  console.log(`Incoming transfer job found to be valid [${valid}] for chainId [${chainId}]`);

  if (!valid) {
    console.error(`Errors found in transfer job`, errors);
    return res.status(400).json({
      error: `Invalid job data`,
      details: errors
    });
  }

  const {token_id, recipient} = rawJobData;

  const escrowService = newEscrowService(chainId);
  const isEscrowed = await escrowService.isTokenEscrowed(token_id);
  if (!isEscrowed) {
    const errorMsg = `Rejecting incoming job - tokenId [${token_id}] is not escrowed for chainId [${chainId}]`;
    console.error(errorMsg);
    return res.status(400).json({
      error: errorMsg
    });
  }

  const isRecipientValid = isValidAddress(recipient);
  if (!isRecipientValid) {
    const errorMsg = `Rejecting incoming job - recipient [${recipient}] is not a valid web3 address`;
    console.error(errorMsg);
    return res.status(400).json({
      error: errorMsg
    });
  }

  const existingJobs = await jobQueue.getJobsInFlightForTokenId(chainId, token_id, JOB_TYPES.TRANSFER_TOKEN);
  if (existingJobs) {
    console.error(`Rejecting incoming job - existing job found for tokenId [${token_id}] and chainId [${chainId}] and job [${JOB_TYPES.TRANSFER_TOKEN}]`);
    return res.status(400).json({
      error: `Duplicate Job found`,
      existingJobs
    });
  }

  // Accept job
  let jobDetails = await jobQueue.addJobToQueue(chainId, JOB_TYPES.TRANSFER_TOKEN, rawJobData);

  // Skip metadata creation for these job types
  jobDetails = jobQueue.addStatusAndContextToJob(chainId, jobDetails.jobId, JOB_STATUS.PRE_PROCESSING_COMPLETE, {});

  console.log(`Job [${JOB_TYPES.TRANSFER_TOKEN}] created for tokenId [${token_id}] and chainId [${chainId}]`);

  // return job details
  return res
    .status(202)
    .json(jobDetails);
});

/**
 * Process the next available IPFS metadata push
 */
job.get('/process/preprocess', async function (req, res) {
  const {chainId} = req.params;

  // Try to get at least 1 job for both token types i.e. tokenlandia and video latino
  const tokenlandiaJobs = await jobQueue.getNextJobForProcessing(
      chainId,
      [JOB_STATUS.ACCEPTED],
      1,
      TOKEN_TYPE.TOKENLANDIA
  );

  let nextBatchSize = 1;
  if (_.size(tokenlandiaJobs) === 0) {
    // batch size request for video latino tokens should be upped to 2 as no tokenlandia jobs found
    nextBatchSize = 2;
  }

  const videoLatinoJobs = await jobQueue.getNextJobForProcessing(
      chainId,
      [JOB_STATUS.ACCEPTED],
      nextBatchSize,
      TOKEN_TYPE.VIDEO_LATINO
  );

  if (_.size(videoLatinoJobs) === 0) {
    return res
        .status(202)
        .json({
          msg: `No jobs found for processing for chain ID [${chainId}]`
        });
  }

  let jobs = _.concat(tokenlandiaJobs, videoLatinoJobs);
  jobs = _.filter(jobs, job => job !== null);

  const workingJobs = _.map(jobs, (job) => {
    switch (job.jobType) {
      case JOB_TYPES.CREATE_TOKEN:
        return metadataCreationProcessor.pushCreateTokenJob(job, job.tokenType);
      case JOB_TYPES.UPDATE_TOKEN:
        return metadataCreationProcessor.pushUpdateTokenJob(job, newTokenLandiaService(chainId));
      case JOB_TYPES.TRANSFER_TOKEN:
        // Skip metadata creation for these job types
        return jobQueue.addStatusAndContextToJob(chainId, job.jobId, JOB_STATUS.PRE_PROCESSING_COMPLETE, {});
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
job.get('/process/transaction', async function (req, res) {
  const {chainId} = req.params;

  const inflightJob = await jobQueue.getNextJobForProcessing(chainId, [JOB_STATUS.TRANSACTION_SENT]);
  if (inflightJob) {
    const mayBeCompleteJob = await jobCompletionProcessor(chainId).processJob(inflightJob);

    if (mayBeCompleteJob.status === JOB_STATUS.TRANSACTION_SENT) {
      return res
        .status(200)
        .json({
          msg: `Inflight transaction found, waiting for job [${inflightJob.jobId}] to complete`,
        });
    }
  }

  const job = await jobQueue.getNextJobForProcessing(chainId, [JOB_STATUS.PRE_PROCESSING_COMPLETE]);

  if (!job) {
    return res
      .status(200)
      .json({
        msg: `No jobs found for processing for chain ID [${chainId}]`,
      });
  }

  const processedJob = await transactionProcessor(chainId).processJob(job);

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
job.get('/process/completions', async function (req, res) {
  const {chainId} = req.params;
  const job = await jobQueue.getNextJobForProcessing(chainId, [JOB_STATUS.TRANSACTION_SENT]);

  if (!job) {
    return res
      .status(200)
      .json({
        msg: `No jobs found for processing for chain ID [${chainId}]`
      });
  }

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

/**
 * Get Job Details for JobId
 */
job.get('/details/:jobId', async function (req, res) {
  const {chainId, jobId} = req.params;
  const jobDetails = await jobQueue.getJobForId(chainId, jobId);

  if (!jobDetails) {
    return res
      .status(400)
      .json({
        error: `Unable to find job [${jobId}] on chain [${chainId}]`
      });
  }

  return res
    .status(200)
    .json(jobDetails);
});

/**
 * Delete a pending Job
 */
job.delete('/cancel', async function (req, res) {
  const {chainId} = req.params;
  const {job_id} = req.body;

  const jobDetails = await jobQueue.getJobForId(chainId, job_id);

  if (!job_id || !chainId || !jobDetails) {
    return res
      .status(400)
      .json({
        error: `Unable to find job [${job_id}] on chain [${chainId}]`
      });
  }

  if (canCancelJob(jobDetails.status)) {
    console.log(`Attempting to cancel job [${job_id}] on chain [${chainId}] with status [${jobDetails.status}]`);
    const updatedJob = await jobQueue.addStatusAndContextToJob(chainId, jobDetails.jobId, JOB_STATUS.JOB_CANCELLED, {
      cancelled: Date.now()
    });

    return res
      .status(200)
      .json(updatedJob);
  }

  return res
    .status(400)
    .json({
      error: `Unable to cancel job [${job_id}] on chain [${chainId}] with status [${jobDetails.status}]`
    });
});

/**
 * Get job summary details
 */
job.get('/summary', async function (req, res) {
  const {chainId} = req.params;
  return res.status(200)
    .json(await jobQueue.getJobTypeSummaryForChainId(chainId));
});

/**
 * Get open jobs for chain
 */
job.get('/open/summary', async function (req, res) {
  const {chainId} = req.params;
  return res.status(200)
    .json(await jobQueue.getIncompleteJobsForChainId(chainId));
});

module.exports = job;
