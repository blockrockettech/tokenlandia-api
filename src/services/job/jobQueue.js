const _ = require('lodash');
const {JOB_STATUS} = require('./jobConstants');

const NEXT_STATES = {
  [JOB_STATUS.ACCEPTED]: [JOB_STATUS.METADATA_CREATED],
  [JOB_STATUS.METADATA_CREATED]: [JOB_STATUS.TRANSACTION_SENT],
  [JOB_STATUS.TRANSACTION_SENT]: [JOB_STATUS.JOB_COMPLETE, JOB_STATUS.TRANSACTION_FAILED]
};

class JobQueue {

  constructor(db) {
    this.db = db;
  }

  async addJobToQueue(chainId, jobType, jobData) {
    const {token_id} = jobData;

    console.log('Adding job to queue', {chainId, jobType, token_id});

    const newJob = {
      // Job data
      chainId: _.toString(chainId),
      tokenId: _.toString(token_id),
      status: JOB_STATUS.ACCEPTED,
      jobType: jobType,
      createdDate: Date.now(),

      // The actual payload
      context: {
        [JOB_STATUS.ACCEPTED]: {
          ...jobData
        }
      }
    };

    // generate Joc ID and place in DB queue
    // /process-queue/${chain_id}/jobs/${job}
    const createdDocRef = await this.getJobsCollectionRef(chainId)
      .add(newJob);

    console.log(`Job created for token ID [${token_id}] chain ID [${chainId}] and type [${jobType}] - document ID [${createdDocRef.id}]`);

    return {
      jobId: createdDocRef.id,
      ...newJob
    };
  }

  async addStatusAndContextToJob(chainId, jobId, status, context) {
    console.log('Adding status context to job', {chainId, jobId, status});

    const job = await this.getJobForId(chainId, jobId);
    if (!job) {
      throw new Error(`Job cannot be found for job ID [${jobId}] and chain ID [${chainId}]`);
    }

    if (!_.includes(NEXT_STATES[job.status], status)) {
      throw new Error(`Invalid state transition for job id [${jobId}] on chain ID [${chainId}]. Attempting to go from ${job.status} -> ${status}`);
    }

    const newContext = {
      ...job.context,
      [status]: context
    };

    await this.getJobsCollectionRef(chainId)
      .doc(jobId)
      .set({
        context: newContext,
        status
      }, {merge: true});

    // Return the newly updated job
    return this.getJobForId(chainId, jobId);
  }

  async getNextJobForProcessing(chainId, statuses, limit = 1) {
    console.log(`Get next job for processing for chain [${chainId}]`);

    return this.getJobsCollectionRef(chainId)
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

  async getJobForId(chainId, jobId) {
    console.log('Getting job details', {chainId, jobId});

    return this.getJobsCollectionRef(chainId)
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

  async getJobsForTokenId(chainId, tokenId, jobType) {
    console.log('Get jobs for token', {chainId, tokenId, jobType});

    return this.getJobsCollectionRef(chainId)
      .where('tokenId', '==', _.toString(tokenId))
      .where('jobType', '==', _.toString(jobType))
      .get()
      .then((snapshot) => {

        if (snapshot.empty) {
          console.log('No matching documents found', {chainId, tokenId, jobType});
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

  async getJobTypeSummaryForChainId(chainId, jobType) {
    const numOfJobsForJobType = await this.getJobsCollectionRef(chainId)
      .where('jobType', '==', _.toString(jobType))
      .get()
      .then(snapshot => {
        return snapshot.size;
      });

    const numOfAcceptedJobs = await this.getJobsCollectionRef(chainId)
      .where('jobType', '==', _.toString(jobType))
      .where('status', '==', JOB_STATUS.ACCEPTED)
      .get()
      .then(snapshot => {
        return snapshot.size;
      });

    const numOfMetadataCreatedJobs = await this.getJobsCollectionRef(chainId)
      .where('jobType', '==', _.toString(jobType))
      .where('status', '==', JOB_STATUS.METADATA_CREATED)
      .get()
      .then(snapshot => {
        return snapshot.size;
      });

    const numOfTransactionSentJobs = await this.getJobsCollectionRef(chainId)
      .where('jobType', '==', _.toString(jobType))
      .where('status', '==', JOB_STATUS.TRANSACTION_SENT)
      .get()
      .then(snapshot => {
        return snapshot.size;
      });

    const numOfJobCompleteJobs = await this.getJobsCollectionRef(chainId)
      .where('jobType', '==', _.toString(jobType))
      .where('status', '==', JOB_STATUS.JOB_COMPLETE)
      .get()
      .then(snapshot => {
        return snapshot.size;
      });

    const numOfTransactionFailedJobs = await this.getJobsCollectionRef(chainId)
      .where('jobType', '==', _.toString(jobType))
      .where('status', '==', JOB_STATUS.TRANSACTION_FAILED)
      .get()
      .then(snapshot => {
        return snapshot.size;
      });

    return {
      numOfJobsForJobType,
      numOfAcceptedJobs,
      numOfMetadataCreatedJobs,
      numOfTransactionSentJobs,
      numOfJobCompleteJobs,
      numOfTransactionFailedJobs
    };
  }

  getJobsCollectionRef(chainId) {
    return this.db
      .collection('job-queue')
      .doc(_.toString(chainId))
      .collection('jobs');
  }

}

module.exports = JobQueue;
