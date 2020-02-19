const IJobProcessor = require('../interfaces/ijob.processor');
const {ipfsService} = require('../index');

class PreMintingService extends IJobProcessor {
  // TODO - handle IPFS failures at both push stages by storing IPFS hash to save re-pushing
  processJob(jobId) {
    // TODO - get job data
    // TODO - Use ipfs service to push image and get IPFS hash
    // TODO - Generate 721 JSON metadata with name, image, type + attributes
    // TODO - Use ipfs service to push 721 JSON and store IPFS hash
    // TODO - move job onto the next stage?
  }
}

module.exports = PreMintingService;
