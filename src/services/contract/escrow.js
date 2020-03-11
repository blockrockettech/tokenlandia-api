const {ethers} = require('ethers');
const {
  getEscrowContractAddress,
  getTokenLandiaContractAddress
} = require('../../utils/truffle');
const EscrowContractTruffleConf = require('../../truffleconf/escrow/TrustedNftEscrow');

const {getWallet, getHttpProvider} = require('../../web3/provider');

class EscrowService {

  constructor(chainId) {
    this.chainId = chainId;

    try {
      this.signer = getWallet(chainId);
      this.provider = getHttpProvider(chainId);
    } catch (e) {
      throw new Error(`Invalid chain ID [${chainId}]`);
    }

    this.nftContractAddress = getTokenLandiaContractAddress(this.chainId);
    this.escrowContractAddress = getEscrowContractAddress(this.chainId);

    if (!this.nftContractAddress || !this.escrowContractAddress) {
      throw new Error(`No contracts for chain ID '${chainId}'`);
    }

    this.contract = new ethers.Contract(
      this.escrowContractAddress,
      EscrowContractTruffleConf.abi,
      this.signer
    );
  }

  async isTokenEscrowed(tokenId) {
    return await this.contract.isTokenEscrowed(this.nftContractAddress, tokenId).call();
  }

  async transferOwnership(tokenId, recipient) {
    return await this.contract.transferOwnership(this.nftContractAddress, tokenId, recipient);
  }

}

module.exports = EscrowService;
