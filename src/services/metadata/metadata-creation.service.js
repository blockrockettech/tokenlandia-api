const IJobProcessor = require('../interfaces/ijob.processor');
const {jobQueue, ipfsService} = require('../index');

class MetadataCreationService extends IJobProcessor {
  // TODO - handle IPFS failures at both push stages by storing IPFS hash to save re-pushing
  async processJob(chainId, jobId) {

    const job = await jobQueue.getJobForId(chainId, jobId);
    // TODO - complain if job does not exist

    // Extract required data from job
    const {data} = job;
    const {name, description, image, ...restOfData} = data;

    // TODO - Use ipfs service to push image and get IPFS hash
    const imageIpfsHash = await ipfsService.uploadImageToIpfs(image);

    // Generate 721 JSON metadata with name, image, type + attributes
    const erc721Metadata = {
      name,
      description,
      image: `${ipfsService.getBaseUrl()}/ipfs/${imageIpfsHash}`,
      type: 'PHYSICAL_ASSET',
      created: Math.floor( Date.now() / 1000 ),
      attributes: {
        ...restOfData
      }
    };

    // Use ipfs service to push 721 JSON and store IPFS hash
    const metadataIpfsHash = await ipfsService.pushJsonToIpfs(erc721Metadata);

    // TODO - move job onto the next stage?
  }
}

module.exports = MetadataCreationService;
