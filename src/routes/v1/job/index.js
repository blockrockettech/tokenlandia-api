const _ = require('lodash');
const {utils} = require('ethers');

const job = require('express').Router({mergeParams: true});

const {
  jobQueue,
  jobValidator,
  jobConstants,
  newTokenLandiaService,
  newEscrowService,
  transactionProcessor,
  metadataCreationProcessor,
  jobCompletionProcessor
} = require('../../../services/index');

const {JOB_STATUS, JOB_TYPES} = jobConstants;

function isValidAddress(address) {
  try {
    utils.getAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Submit a new Job to create a new token
 */
job.post('/submit/createtoken/general', async function (req, res) {

  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await jobValidator.isValidCreateTokenJob(rawJobData);
  console.log(`Incoming job found to be valid [${valid}] for chainId [${chainId}]`);

  if (!valid) {
    console.error(`Errors found in job`, errors);
    return res.status(400).json({
      error: `Invalid job data`,
      details: errors
    });
  }

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
    type: 'PHYSICAL_ASSET',
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
 * Submit a new Job to update a new token
 */
job.post('/submit/updatetoken/general', async function (req, res) {

  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await jobValidator.isValidUpdateTokenJob(rawJobData);
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

  const existingJob = await jobQueue.getJobsForTokenId(chainId, token_id, JOB_TYPES.UPDATE_TOKEN);
  if (existingJob) {
    console.error(`Incoming job - existing job found for tokenId [${token_id}] and chainId [${chainId}] and job [${JOB_TYPES.UPDATE_TOKEN}]`);
    return res.status(400).json({
      error: `Duplicate Job found`,
      existingJob
    });
  }

  // Build full job data from composite properties
  const jobData = {
    ...rawJobData,
    type: 'PHYSICAL_ASSET',
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
 * Submit a new Job to transfer a token
 */
job.post('/submit/transfer', async function (req, res) {
  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await jobValidator.isValidTransferTokenJob(rawJobData);
  console.log(`Incoming update job found to be valid [${valid}] for chainId [${chainId}]`);

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


  const existingJob = await jobQueue.getJobsForTokenId(chainId, token_id, JOB_TYPES.TRANSFER_TOKEN);
  if (existingJob) {
    console.error(`Rejecting incoming job - existing job found for tokenId [${token_id}] and chainId [${chainId}] and job [${JOB_TYPES.TRANSFER_TOKEN}]`);
    return res.status(400).json({
      error: `Duplicate Job found`,
      existingJob
    });
  }

  // Accept job
  const jobDetails = await jobQueue.addJobToQueue(chainId, JOB_TYPES.TRANSFER_TOKEN, rawJobData);
  console.log(`Job [${JOB_TYPES.TRANSFER_TOKEN}] created for tokenId [${token_id}] and chainId [${chainId}]`);

  // return job details
  return res
    .status(202)
    .json(jobDetails);
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
 * Process the next available IPFS metadata push
 */
job.get('/process/metadata', async function (req, res) {
  const {chainId} = req.params;
  const jobs = await jobQueue.getNextJobForProcessing(chainId, [JOB_STATUS.ACCEPTED], 2);

  if (_.size(jobs) === 0) {
    return res
      .status(202)
      .json({
        msg: `No jobs found for processing for chain ID [${chainId}]`
      });
  }

  const workingJobs = _.map(jobs, (job) => {
    switch (job.jobType) {
      case JOB_TYPES.CREATE_TOKEN:
        return metadataCreationProcessor.pushCreateTokenJob(job);
      case JOB_TYPES.UPDATE_TOKEN:
        return metadataCreationProcessor.pushUpdateTokenJob(job);
      case JOB_TYPES.TRANSFER_TOKEN:
        // Skip metadata creation
        return jobQueue.addStatusAndContextToJob(chainId, job.jobId, JOB_STATUS.PRE_PROCESSING_COMPLETE, null);
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
          msg: `Processing job [${processedJob.jobId}]`,
          chainId: chainId,
          tokenId: processedJob.tokenId,
          jobId: processedJob.jobId,
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
  const job = await jobQueue.getNextJobForProcessing(chainId, [JOB_STATUS.PRE_PROCESSING_COMPLETE]);

  if (!job) {
    return res
      .status(200)
      .json({
        msg: `No jobs found for processing for chain ID [${chainId}]`,
      });
  }

  const inflightJob = await jobQueue.getNextJobForProcessing(chainId, [JOB_STATUS.TRANSACTION_SENT]);
  if (inflightJob) {
    return res
      .status(200)
      .json({
        msg: `Inflight transaction found, waiting for job [${inflightJob.id}] to complete`,
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
      status: processedJob.status
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
 * Get job summary details
 */
job.get('/summary', async function (req, res) {
  const {chainId} = req.params;
  return res.status(200)
    .json(await jobQueue.getJobTypeSummaryForChainId(chainId));
});

module.exports = job;
