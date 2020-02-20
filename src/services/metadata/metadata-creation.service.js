const IJobProcessor = require('../interfaces/ijob.processor');
class MetadataCreationService extends IJobProcessor {

  constructor(jobQueue, ipfsService) {
    super();
    this.jobQueue = jobQueue;
    this.ipfsService = ipfsService;
  }

  // TODO - handle IPFS failures at both push stages by storing IPFS hash to save re-pushing
  async processJob(chainId, jobId) {
    const job = await this.jobQueue.getJobForId(chainId, jobId);
    if (!job) {
      throw new Error('Metadata creation - process job - job does not exist or database error');
    }

    // Extract required data from job
    const {data} = job;
    const {name, description, image, type, ...restOfData} = data;

    // TODO - Use ipfs service to push image and get IPFS hash
    const imageIpfsHash = await this.ipfsService.uploadImageToIpfs(image);

    // Generate 721 JSON metadata with name, image, type + attributes
    const erc721Metadata = {
      name,
      description,
      image: `${this.ipfsService.getBaseUrl()}/ipfs/${imageIpfsHash}`,
      type,
      created: Math.floor(Date.now() / 1000),
      attributes: {
        ...restOfData
      }
    };

    // Use ipfs service to push 721 JSON and store IPFS hash
    const metadataIpfsHash = await this.ipfsService.pushJsonToIpfs(erc721Metadata);
    console.log(`${this.ipfsService.getBaseUrl()}/ipfs/${metadataIpfsHash}`);

    // TODO - move job onto the next stage?
  }
}

module.exports = MetadataCreationService;
