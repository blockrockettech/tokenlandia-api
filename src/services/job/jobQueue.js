const _ = require('lodash');
const {JOB_STATUS} = require('./jobConstants');

class JobQueue {

  constructor(db) {
    this.db = db;
  }

  async addJobToQueue(chainId, jobType, jobData) {
    console.log('Add job to queue', {chainId, jobType}, jobData);

    const {token_id} = jobData;

    const newJob = {
      // Job data
      chainId: _.toString(chainId),
      tokenId: _.toString(token_id),
      status: JOB_STATUS.CREATED,
      jobType: jobType,
      createdDate: Date.now(),

      // The actual payload
      context: {
        [JOB_STATUS.CREATED]: {
          ...jobData
        }
      }
    };

    // generate Joc ID and place in DB queue
    // /process-queue/${chain_id}/jobs/${job}
    const createdDocRef = await this.getJobsCollectionRef(chainId).add(newJob);
    console.log(`Job created`, newJob, createdDocRef);

    return {
      jobId: createdDocRef.id,
      ...newJob
    };
  }

  async getJobForId(chainId, jobId) {
    console.log('Get job', {chainId, jobId});

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
    console.log('Get jobs for token', {chainId: chainId, tokenId: tokenId, jobType: jobType});

    return this.getJobsCollectionRef(chainId)
      .where('chainId', '==', _.toString(chainId))
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
