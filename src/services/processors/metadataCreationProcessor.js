const axios = require('axios');
const _ = require('lodash');

const {JOB_STATUS} = require('../job/jobConstants');

const BASE_IPFS_URL = 'https://ipfs.infura.io/ipfs';

class MetadataCreationProcessor {

  constructor(jobQueue, ipfsService) {
    this.jobQueue = jobQueue;
    this.ipfsService = ipfsService;
  }

  async pushCreateTokenJob(job) {

    const {context, chainId, jobId} = job;
    console.log(`MetadataCreationProcessor - create token job [${jobId}] on chain [${chainId}]`);

    const acceptedJobContext = context[JOB_STATUS.ACCEPTED];
    const {name, description, image, type, ...restOfData} = acceptedJobContext;

    let imageHash;

    try {
      imageHash = await this.ipfsService.uploadImageToIpfs(image);
    } catch (e) {
      console.error(`Failed to upload image to IPFS for job ID [${jobId}], chain ID [${chainId}], token type [${job.tokenType}] due to`, e);

      if (e.message === 'IMAGE_URL_INVALID') {
        console.log('Failing job as image URL invalid');
        return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.PRE_PROCESSING_FAILED, e.message, job.tokenType);
      }

      return job;
    }

    // Generate 721 JSON metadata with name, image, type + attributes
    const metadata = {
      name,
      description,
      image: `${BASE_IPFS_URL}/${imageHash}`,
      type,
      created: Math.floor(Date.now() / 1000),
      attributes: {
        // Product code not required as part of metadata attributes
        ..._.omit(restOfData, 'product_code')
      }
    };

    // Use ipfs service to push 721 JSON and store IPFS hash
    let metadataHash;

    try {
      metadataHash = await this.ipfsService.pushJsonToIpfs(metadata);
    } catch (e) {
      console.error(`Failed to upload metadata to IPFS for job ID [${jobId}] chain ID [${chainId}] due to`, e);
      return job;
    }

    const newContext = {
      metadataHash,
      metadata
    };

    return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.PRE_PROCESSING_COMPLETE, newContext, job.tokenType);
  }

  async pushUpdateTokenJob(job, tokenService) {

    const {context, chainId, jobId} = job;
    console.log(`MetadataCreationProcessor - update token job [${jobId}] on chain [${chainId}]`);

    const acceptedJobContext = context[JOB_STATUS.ACCEPTED];
    const {token_id, type, ...updatedAttributes} = acceptedJobContext;

    const tokenURI = await tokenService.tokenURI(token_id);

    const {data} = await axios.get(tokenURI);

    const existingAttributes = _.get(data, 'attributes');

    // Create new blob with updated fields
    const metadata = {
      ...data,
      type,
      attributes: {
        ...existingAttributes,
        ...updatedAttributes,
        type
      }
    };

    // Use ipfs service to push 721 JSON and store IPFS hash
    let metadataHash;

    try {
      metadataHash = await this.ipfsService.pushJsonToIpfs(metadata);
    } catch (e) {
      console.error(`Failed to upload metadata to IPFS for job ID [${jobId}] chain ID [${chainId}] due to`, e);
      return job;
    }

    const newContext = {
      metadataHash,
      metadata
    };

    return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.PRE_PROCESSING_COMPLETE, newContext);
  }
}

module.exports = MetadataCreationProcessor;
