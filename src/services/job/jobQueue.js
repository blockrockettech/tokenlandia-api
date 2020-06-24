const _ = require('lodash');
const {JOB_STATUS, JOB_TYPES, TOKEN_TYPE, canMoveToStatus} = require('./jobConstants');

const INFLIGHT_JOB_STATUSES = [JOB_STATUS.ACCEPTED, JOB_STATUS.PRE_PROCESSING_COMPLETE, JOB_STATUS.TRANSACTION_SENT];

class JobQueue {

  constructor(db) {
    this.db = db;
  }

  async addJobToQueue(
      chainId,
      jobType,
      jobData,
      tokenType = TOKEN_TYPE.TOKENLANDIA,
      initialState = JOB_STATUS.ACCEPTED
  ) {
    const {token_id} = jobData;

    console.log('Adding job to queue', {chainId, jobType, tokenType, token_id});

    const newJob = {
      // Job data
      chainId: _.toString(chainId),
      tokenId: _.toString(token_id),
      status: initialState,
      jobType,
      tokenType,
      createdDate: Date.now(),

      // The actual payload
      context: {
        [initialState]: {
          ...jobData
        }
      }
    };

    // generate Joc ID and place in DB queue
    // /process-queue/${chain_id}/jobs/${job}
    const createdDocRef = await this.getJobsCollectionRef(tokenType, chainId)
      .add(newJob);

    console.log(`Job type [${jobType}] created for token ID [${token_id}] chain ID [${chainId}] and token type [${tokenType}] - document ID [${createdDocRef.id}]`);

    return {
      jobId: createdDocRef.id,
      ...newJob
    };
  }

  async addStatusAndContextToJob(chainId, jobId, status, context, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    console.log('Adding status context to job', {chainId, jobId, status, tokenType});

    const job = await this.getJobForId(chainId, jobId, tokenType);
    if (!job) {
      throw new Error(`Job cannot be found for token type [${tokenType}], job ID [${jobId}] and chain ID [${chainId}]`);
    }

    if (!canMoveToStatus(job.status, status)) {
      throw new Error(`Invalid state transition for job id [${jobId}] on chain ID [${chainId}]. Attempting to go from ${job.status} -> ${status}`);
    }

    const newContext = {
      ...job.context,
      [status]: context
    };

    await this.getJobsCollectionRef(tokenType, chainId)
      .doc(jobId)
      .set({
        context: newContext,
        status
      }, {merge: true});

    // Return the newly updated job
    return this.getJobForId(chainId, jobId, tokenType);
  }

  async getNextJobForProcessing(chainId, statuses, limit = 1, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    console.log(`Get next ${tokenType} job for processing for chain [${chainId}]`);

    return this.getJobsCollectionRef(tokenType, chainId)
      .where('status', 'in', statuses)
      .orderBy('createdDate', 'asc')
      .limit(limit)
      .get()
      .then((snapshot) => {

        if (snapshot.empty) {
          console.log('No jobs to process for chain [${chainId}]');
          return null;
        }

        // Single job
        if (limit === 1) {
          const document = snapshot.docs[0];
          return {
            jobId: document.id,
            ...document.data()
          };
        }

        // Multiple job
        const jobs = [];
        snapshot.forEach(doc => jobs.push({
          jobId: doc.id,
          ...doc.data()
        }));

        return jobs;
      });
  }

  async getJobForId(chainId, jobId, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    console.log('Getting job details', {chainId, jobId, tokenType});

    return this.getJobsCollectionRef(tokenType, chainId)
      .doc(jobId)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          console.log('No such document found', {chainId, jobId});
          return null;
        }
        return {
          jobId: doc.id,
          ...doc.data()
        };
      });
  }

  async getJobsForTokenId(chainId, tokenId, jobType, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    console.log('Get jobs for token', {chainId, tokenId, jobType, tokenType});

    return this.getJobsCollectionRef(tokenType, chainId)
      .where('tokenId', '==', _.toString(tokenId))
      .where('jobType', '==', _.toString(jobType))
      .get()
      .then((snapshot) => {

        if (snapshot.empty) {
          console.log('No matching documents found', {chainId, tokenId, jobType, tokenType});
          return null;
        }

        const jobs = [];

        snapshot.forEach(doc => jobs.push({
          jobId: doc.id,
          ...doc.data()
        }));

        return jobs;
      });
  }

  async getJobsInFlightForTokenId(chainId, tokenId, jobType, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    console.log('Get jobs for token', {chainId, tokenId, jobType, tokenType});

    return this.getJobsCollectionRef(tokenType, chainId)
      .where('tokenId', '==', _.toString(tokenId))
      .where('jobType', '==', _.toString(jobType))
      .where('status', 'in', INFLIGHT_JOB_STATUSES)
      .get()
      .then((snapshot) => {

        if (snapshot.empty) {
          console.log('No matching documents found', {chainId, tokenId, jobType, tokenType});
          return null;
        }

        const jobs = [];

        snapshot.forEach(doc => jobs.push({
          jobId: doc.id,
          ...doc.data()
        }));

        return jobs;
      });
  }

  async getJobTypeSummaryForChainId(chainId, tokenType = TOKEN_TYPE.TOKENLANDIA) {

    const getSummaryInfo = async (jobType) => {
      const numOfJobsForJobType = await this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .get()
        .then(snapshot => {
          return snapshot.size;
        });

      const numOfAcceptedJobs = await this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .where('status', '==', JOB_STATUS.ACCEPTED)
        .get()
        .then(snapshot => {
          return snapshot.size;
        });

      const numOfPreProcessingCompleteJobs = await this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .where('status', '==', JOB_STATUS.PRE_PROCESSING_COMPLETE)
        .get()
        .then(snapshot => {
          return snapshot.size;
        });

      const numOfPreProcessingFailedJobs = await this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .where('status', '==', JOB_STATUS.PRE_PROCESSING_FAILED)
        .get()
        .then(snapshot => {
          return snapshot.size;
        });

      const numOfTransactionSentJobs = await this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .where('status', '==', JOB_STATUS.TRANSACTION_SENT)
        .get()
        .then(snapshot => {
          return snapshot.size;
        });

      const numOfJobCompleteJobs = await this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .where('status', '==', JOB_STATUS.JOB_COMPLETE)
        .get()
        .then(snapshot => {
          return snapshot.size;
        });

      const numOfTransactionFailedJobs = await this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .where('status', '==', JOB_STATUS.TRANSACTION_FAILED)
        .get()
        .then(snapshot => {
          return snapshot.size;
        });

      return {
        numOfJobsForJobType,
        numOfAcceptedJobs,
        numOfPreProcessingCompleteJobs,
        numOfPreProcessingFailedJobs,
        numOfTransactionSentJobs,
        numOfJobCompleteJobs,
        numOfTransactionFailedJobs
      };
    };

    return {
      [JOB_TYPES.CREATE_TOKEN]: await getSummaryInfo(JOB_TYPES.CREATE_TOKEN),
      [JOB_TYPES.UPDATE_TOKEN]: await getSummaryInfo(JOB_TYPES.UPDATE_TOKEN),
      [JOB_TYPES.TRANSFER_TOKEN]: await getSummaryInfo(JOB_TYPES.TRANSFER_TOKEN),
    };
  }

  async getIncompleteJobsForChainId(chainId, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    const getOpenJobsSummary = async (jobType) => {
      return this.getJobsCollectionRef(tokenType, chainId)
        .where('jobType', '==', _.toString(jobType))
        .where('status', 'in', INFLIGHT_JOB_STATUSES)
        .get()
        .then(snapshot => {
          const jobs = [];
          snapshot.forEach(doc => jobs.push({
            jobId: doc.id,
            ...doc.data()
          }));
          return jobs;
        });
    };

    return {
      [JOB_TYPES.CREATE_TOKEN]: await getOpenJobsSummary(JOB_TYPES.CREATE_TOKEN),
      [JOB_TYPES.UPDATE_TOKEN]: await getOpenJobsSummary(JOB_TYPES.UPDATE_TOKEN),
      [JOB_TYPES.TRANSFER_TOKEN]: await getOpenJobsSummary(JOB_TYPES.TRANSFER_TOKEN),
    };
  }

  getJobsCollectionRef(tokenType, chainId) {
    return this.db
      .collection(`${tokenType.toLowerCase()}-queue`) // e.g. tokenlandia-queue, video_latino-queue etc.
      .doc(_.toString(chainId))
      .collection('jobs');
  }

}

module.exports = JobQueue;
