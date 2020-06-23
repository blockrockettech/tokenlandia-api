const TokenService = require('./token');
const VideoLatinoTruffleConf = require('../../truffleconf/token/VideoLatino.json');

class VideoLatino extends TokenService {
  constructor(chainId) {
    super(chainId, VideoLatinoTruffleConf);
  }

  async tokenIdForProductId(productId) {
    return this._tokenIdForProductId(productId, 'tokenIdForVideoId');
  }

  async updateIpfsHash(tokenId, ipfsHash) {
    return this._updateIpfsHash(tokenId, ipfsHash, 'updateMetadataIpfsHash');
  }
}

module.exports = VideoLatino;
