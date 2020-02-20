const BASE_IPFS_URL = 'https://ipfs.infura.io/ipfs';

class MetadataCreationProcessor  {

  constructor(jobQueue, ipfsService) {
    this.jobQueue = jobQueue;
    this.ipfsService = ipfsService;
  }

  async processJob(job) {
    // Extract required data from job
    const {data} = job;
    const {name, description, image, type, ...restOfData} = data;

    const imageIpfsHash = await this.ipfsService.uploadImageToIpfs(image);

    // Generate 721 JSON metadata with name, image, type + attributes
    const erc721Metadata = {
      name,
      description,
      image: `${BASE_IPFS_URL}/${imageIpfsHash}`,
      type,
      created: Math.floor(Date.now() / 1000),
      attributes: {
        // Product code not required as part of metadata attributes
        ..._.omit(restOfData, 'product_code')
      }
    };

    // Use ipfs service to push 721 JSON and store IPFS hash
    const metadataIpfsHash = await this.ipfsService.pushJsonToIpfs(erc721Metadata);
    console.log(`${BASE_IPFS_URL}/${metadataIpfsHash}`);

    // TODO - move job onto the next stage?
    // TODO - update and store job
  }
}

module.exports = MetadataCreationProcessor;
