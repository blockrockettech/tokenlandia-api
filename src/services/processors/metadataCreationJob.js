const IJobProcessor = require('./IJobProcessor');

class MetadataCreationJob extends IJobProcessor {

  constructor(jobQueue, ipfsService) {
    super();
    this.jobQueue = jobQueue;
    this.ipfsService = ipfsService;
  }

  // TODO - handle IPFS failures at both push stages by storing IPFS hash to save re-pushing

  async processJob(chainId, jobId) {
    const job = await this.jobQueue.getJobForId(chainId, jobId);

    // TODO move this check the controller
    if (!job) {
      throw new Error('Metadata creation - process job - job does not exist or database error');
    }

    // Extract required data from job
    const {data} = job;
    const {name, description, image, type, ...restOfData} = data;

    const imageIpfsHash = await this.ipfsService.uploadImageToIpfs(image);

    // Generate 721 JSON metadata with name, image, type + attributes
    const erc721Metadata = {
      name,
      description,
      image: `${this.ipfsService.getBaseUrl()}/${imageIpfsHash}`,
      type,
      created: Math.floor(Date.now() / 1000),
      attributes: {
        // Product code not required as part of metadata attributes
        ..._.omit(restOfData, 'product_code')
      }
    };

    // Use ipfs service to push 721 JSON and store IPFS hash
    const metadataIpfsHash = await this.ipfsService.pushJsonToIpfs(erc721Metadata);
    console.log(`${this.ipfsService.getBaseUrl()}/${metadataIpfsHash}`);

    // TODO - move job onto the next stage?

  }
}

module.exports = MetadataCreationJob;
