const _ = require('lodash');
const {JOB_STATUS} = require('./jobConstants');

class JobQueue {

  constructor(db) {
    this.db = db;
  }

  async addJobToQueue(chainId, jobType, jobData) {
    console.log('Adding job to queue', {chainId, jobType}, jobData);

    const {token_id} = jobData;

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

    console.log(`Job created`, newJob, createdDocRef);

    return {
      jobId: createdDocRef.id,
      ...newJob
    };
  }

  async addStatusAndContextToJob(chainId, jobId, status, context) {
    console.log('Adding status context to job', {chainId, jobId, status}, context);

    const job = this.getJobForId(chainId, jobId);
    if (!job) {
      throw new Error(`Job cannot be found for job ID [${jobId}] and chain ID [${chainId}]`);
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

  async getNextJobForProcessing(chainId, statuses) {
    console.log(`Get next job for processing for chain [${chainId}]`);

    return this.getJobsCollectionRef(chainId)
      .where('status', 'in', statuses)
      .orderBy('createdDate', 'desc')
      .limit(1)
      .get()
      .then((snapshot) => {

        if (snapshot.empty) {
          console.log('No jobs to process for chain [${chainId}]');
          return null;
        }

        const document = snapshot.docs[0];
        return {
          jobId: document.id,
          ...document.data()
        };
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

  getJobsCollectionRef(chainId) {
    return this.db
      .collection('job-queue')
      .doc(_.toString(chainId))
      .collection('jobs');
  }

}

module.exports = JobQueue;
