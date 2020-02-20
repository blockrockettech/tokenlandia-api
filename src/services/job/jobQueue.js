const _ = require('lodash');
const {JOB_STATUS} = require('./jobConstants');

class JobQueue {

  constructor(db) {
    this.db = db;
  }

  async addJobToQueue(chainId, jobType, jobData) {

    const {token_id} = jobData;

    // /process-queue/${chain_id}/jobs/${job}
    let jobsCollectionRef = this.getJobsCollectionRef(chainId.toString());

    const newJob = {
      // Job data
      chainId: chainId.toString(),
      tokenId: token_id.toString(),
      status: JOB_STATUS.CREATED,
      jobType: jobType,
      createdDate: Date.now(),
      attempts: 0,

      // The actual payload
      data: {
        ...jobData
      }
    };

    // generate Joc ID and place in DB queue
    let createdJob = jobsCollectionRef.add(newJob);
    console.log(`Job created`, newJob, createdJob);

    return createdJob;
  }

  async getJobForId(chainId, jobId) {
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
    return this.getJobsCollectionRef(chainId)
      .where('chainId', '==', chainId)
      .where('tokenId', '==', tokenId)
      .where('jobType', '==', jobType)
      .get()
      .then((snapshot) => {

        if (snapshot.empty) {
          console.log('No matching documents found', {chainId, tokenId, jobType});
          return null;
        }

        return snapshot.map(doc => ({
          jobId: doc.id,
          ...doc.data()
        }));
      });
  }

  getJobsCollectionRef(chainId) {
    return this.db
      .collection('process-queue')
      .doc(chainId)
      .collection('jobs');
  }
}

module.exports = JobQueue;
