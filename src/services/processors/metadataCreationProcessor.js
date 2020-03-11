const axios = require('axios');
const _ = require('lodash');

const TokenLandia = require('../contract/tokenlandia');

const {JOB_STATUS} = require('../job/jobConstants');

const BASE_IPFS_URL = 'https://ipfs.infura.io/ipfs';

class MetadataCreationProcessor {

  constructor(jobQueue, ipfsService) {
    this.jobQueue = jobQueue;
    this.ipfsService = ipfsService;
  }

  async pushCreateTokenJob(job) {

    const {context, chainId, jobId} = job;
    console.log(`MetadataCreationProcessor - job [${jobId}] on chain [${chainId}]`);

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

  async pushUpdateTokenJob(job) {

    const {context, chainId, jobId} = job;
    console.log(`MetadataCreationProcessor - job [${jobId}] on chain [${chainId}]`);

    const acceptedJobContext = context[JOB_STATUS.ACCEPTED];
    const {token_id, type, ...updatedAttributes} = acceptedJobContext;

    const tokenLandiaService = new TokenLandia(chainId);
    const tokenURI = await tokenLandiaService.tokenURI(token_id);

    const {data} = await axios.get(tokenURI);

    const existingAttributes = _.get(data, 'attributes');

    // Create new blob with updated fields
    const metadata = {
      ...data,
      attributes: {
        ...existingAttributes,
        ...updatedAttributes
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
