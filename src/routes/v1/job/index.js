const job = require('express').Router({mergeParams: true});

const {
  jobQueue,
  jobValidator,
  jobConstants,
  newTokenLandiaService
} = require('../../../services/index');

const {JOB_STATUS, JOB_TYPES} = jobConstants;

job.post('/submit/createtoken', async function (req, res) {

  const chainId = req.params;
  const jobData = req.body;

  if (!jobValidator.isValidCreateTokenJob(jobData)) {
    // TODO validate payload - very strict rules - fail fast/hard
  }

  const {token_id} = jobData;

  const existingJob = jobQueue.getJobsForTokenId(chainId, token_id, JOB_TYPES.CREATE_TOKEN);
  if (existingJob) {
    return res
      .status(400)
      .json({
        error: `Duplicate Job found`,
        data: {
          ...existingJob
        }
      });
  }

  const tokenLandiaService = newTokenLandiaService(chainId);
  const tokenExists = await tokenLandiaService.tokenExists(token_id);
  if (tokenExists) {
    return res
      .status(400)
      .json({
        error: `Token already creation`,
      });
  }

  // accept job
  const jobDetails = await jobQueue.addJobToQueue(jobData, JOB_TYPES.CREATE_TOKEN);

  // return job details
  return res
    .status(202)
    .json(jobDetails);
});

job.put('/cancel/:jobId', async function (req, res) {

  const {jobId, chainId} = req.params;
  const jobDetails = await jobQueue.getJobForId(chainId, jobId);

  if (!jobDetails) {
    return res
      .status(400)
      .json({
        error: `Unable to find job [${jobId}] on chain [${chainId}]`
      });
  }

  // only remove jobs which are not in flight
  if (jobDetails.status !== JOB_STATUS.CREATED) {
    return res
      .status(400)
      .json({
        error: `Unable to cancel job which is being worked - job ID [${jobId}]`,
        details: jobDetails
      });
  }

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
