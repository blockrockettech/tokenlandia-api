const {ethers} = require('ethers');
const {
  getEscrowContractAddress,
  getTokenLandiaContractAddress,
  getVideoLatinoContractAddress,
} = require('../../utils/truffle');
const EscrowContractTruffleConf = require('../../truffleconf/escrow/TrustedNftEscrow');

const {getWallet, getHttpProvider} = require('../../web3/provider');

const {TOKEN_TYPE} = require('../job/jobConstants');

class EscrowService {

  constructor(chainId) {
    this.chainId = chainId;

    try {
      this.signer = getWallet(chainId);
      this.provider = getHttpProvider(chainId);
    } catch (e) {
      throw new Error(`Invalid chain ID [${chainId}]`);
    }

    this.tokenlandiaContractAddress = getTokenLandiaContractAddress(this.chainId);
    this.videoLatinoContractAddress = getVideoLatinoContractAddress(this.chainId);
    this.escrowContractAddress = getEscrowContractAddress(this.chainId);

    if (!this.tokenlandiaContractAddress || !this.videoLatinoContractAddress || !this.escrowContractAddress) {
      throw new Error(`No contracts for chain ID '${chainId}'`);
    }

    this.contract = new ethers.Contract(
      this.escrowContractAddress,
      EscrowContractTruffleConf.abi,
      this.signer
    );
  }

  getNftContractAddress(tokenType) {
    return tokenType === TOKEN_TYPE.TOKENLANDIA
        ?
        this.tokenlandiaContractAddress
        :
        this.videoLatinoContractAddress;
  }

  async isTokenEscrowed(tokenId, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    try {
      return await this.contract.isTokenEscrowed(this.getNftContractAddress(tokenType), tokenId);
    } catch (e) {
      console.error('Contract call isTokenEscrowed failed',e);
      return false;
    }
  }

  async transferOwnership(tokenId, recipient, tokenType = TOKEN_TYPE.TOKENLANDIA) {
    return await this.contract.transferOwnership(
        this.getNftContractAddress(tokenType),
        tokenId,
        recipient
    );
  }

}

module.exports = EscrowService;
