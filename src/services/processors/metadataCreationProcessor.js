const _ = require('lodash');
const {JOB_STATUS} = require('../job/jobConstants');

const BASE_IPFS_URL = 'https://ipfs.infura.io/ipfs';

class MetadataCreationProcessor {

  constructor(jobQueue, ipfsService) {
    this.jobQueue = jobQueue;
    this.ipfsService = ipfsService;
  }

  async processJob(job) {

    // Job details
    const {context, chainId, jobId} = job;

    // Extract required data from job context
    const data = context[JOB_STATUS.ACCEPTED];

    // Context data
    const {name, description, image, type, ...restOfData} = data;

    const imageHash = await this.ipfsService.uploadImageToIpfs(image);

    const created = Math.floor(Date.now() / 1000);

    // Generate 721 JSON metadata with name, image, type + attributes
    const erc721Metadata = {
      name,
      description,
      image: `${BASE_IPFS_URL}/${imageIpfsHash}`,
      type,
      created,
      attributes: {
        // Product code not required as part of metadata attributes
        ..._.omit(restOfData, 'product_code')
      }
    };

    // Use ipfs service to push 721 JSON and store IPFS hash
    const metadataHash = await this.ipfsService.pushJsonToIpfs(erc721Metadata);

    const newContext = {
      imageHash,
      metadataHash,
      created
    };

    return this.jobQueue.addStatusAndContextToJob(chainId, jobId, JOB_STATUS.METADATA_CREATED, newContext);
  }
}

module.exports = MetadataCreationProcessor;
