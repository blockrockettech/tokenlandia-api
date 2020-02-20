const job = require('express').Router({mergeParams: true});

const {
  jobQueue,
  jobValidator,
  jobConstants,
  newTokenLandiaService
} = require('../../../services/index');

const {JOB_STATUS, JOB_TYPES} = jobConstants;

job.post('/submit/createtoken/general', async function (req, res) {

  const {chainId} = req.params;
  const rawJobData = req.body;

  const {valid, errors} = await jobValidator.isValidCreateTokenJob(rawJobData);
  console.log(`Incoming job found to be valid [${valid}] for chainId [${chainId}]`);

  if (!valid) {
    console.log(`Errors found in job`, errors);
    return res.status(400).json({
      error: `Invalid job data`,
      details: errors
    });
  }

  const {token_id} = rawJobData;

  const tokenLandiaService = newTokenLandiaService(chainId);
  const tokenExists = await tokenLandiaService.tokenExists(token_id);
  console.log(`Incoming job - token exists [${tokenExists}] for tokenId [${token_id}] and chainId [${chainId}]`);

  if (tokenExists) {
    return res.status(400).json({
      error: `Token already created`,
    });
  }

  const existingJob = await jobQueue.getJobsForTokenId(chainId, token_id, JOB_TYPES.CREATE_TOKEN);
  if (existingJob) {
    console.log(`Incoming job - existing jobs found for tokenId [${token_id}] and chainId [${chainId}] and job [${JOB_TYPES.CREATE_TOKEN}]`, existingJob);
    return res.status(400).json({
      error: `Duplicate Job found`
    });
  }

  const {coo, artist_initials, series, design} = rawJobData;

  // Build full job data from composite properties
  const jobData = {
    ...rawJobData,
    type: 'PHYSICAL_ASSET',
    product_id: `${coo}-${artist_initials}-${series}-${design}-${token_id}`
  };

  // accept job
  const jobDetails = await jobQueue.addJobToQueue(chainId, JOB_TYPES.CREATE_TOKEN, jobData);
  console.log(`Job [${JOB_TYPES.CREATE_TOKEN}] created tokenId [${token_id}] and chainId [${chainId}]`, jobDetails);

  // return job details
  return res
    .status(202)
    .json(jobDetails);
});

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
    .status(202)
    .json(jobDetails);
});

module.exports = job;
