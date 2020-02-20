const _ = require('lodash');
const {JOB_STATUS} = require('../job/jobConstants');

const BASE_IPFS_URL = 'https://ipfs.infura.io/ipfs';

class MetadataCreationProcessor {

  constructor(jobQueue, ipfsService) {
    this.jobQueue = jobQueue;
    this.ipfsService = ipfsService;
  }

  async processJob(job) {

    const {context, chainId, jobId} = job;

    const acceptedJobContext = context[JOB_STATUS.ACCEPTED];

    const {name, description, image, type, ...restOfData} = acceptedJobContext;

    const imageHash = await this.ipfsService.uploadImageToIpfs(image);

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
    const metadataHash = await this.ipfsService.pushJsonToIpfs(metadata);

    const newContext = {
      metadataHash,
      metadata
    };

    return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.METADATA_CREATED, newContext);
  }
}

module.exports = MetadataCreationProcessor;
