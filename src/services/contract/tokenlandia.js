const TokenService = require('./token');
const TokenLandiaTruffleConf = require('../../truffleconf/token/Tokenlandia');

class TokenLandia extends TokenService {

  constructor(chainId) {
    super(chainId, TokenLandiaTruffleConf);
  }

  async tokenIdForProductId(productId) {
    return this._tokenIdForProductId(productId, 'tokenIdForProductId');
  }

  async updateIpfsHash(tokenId, ipfsHash) {
    return this._updateIpfsHash(tokenId, ipfsHash, 'updateIpfsHash');
  }
}

module.exports = TokenLandia;
