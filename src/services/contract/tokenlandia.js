const {ethers, constants, utils} = require('ethers');
const TokenLandiaTruffleConf = require('../../truffleconf/token/Tokenlandia');
const {getContractAddressFromTruffleConf} = require('../../utils/truffle');
const {getNetworkName} = require('@blockrocket/utils');
const {getWallet, getHttpProvider} = require('../../web3/provider');

function getBaseUrl(domain, networkName) {
  if (networkName !== 'mainnet') {
    return `https://${networkName}.${domain}`;
  }
  return `https://${domain}`;
}

class TokenLandia {

  constructor(chainId) {
    this.chainId = chainId;

    try {
      this.signer = getWallet(chainId);
      this.provider = getHttpProvider(chainId);
    } catch (e) {
      throw new Error(`Invalid chain ID [${chainId}]`);
    }

    this.contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, this.chainId);

    if (!this.contractAddress) {
      throw new Error(`No contract exists for chain ID '${chainId}'`);
    }

    this.contract = new ethers.Contract(
      this.contractAddress,
      TokenLandiaTruffleConf.abi,
      this.signer
    );
  }

  etherscanUrlForTokenId(tokenId) {
    const baseUrl = getBaseUrl('etherscan.io', getNetworkName(this.chainId));
    return `${baseUrl}/token/${this.contractAddress}?a=${tokenId}`;
  }

  etherscanUrlForTransaction(transactionHash) {
    const baseUrl = getBaseUrl('etherscan.io', getNetworkName(this.chainId));
    return `${baseUrl}/tx/${transactionHash}`;
  }

  openSeaUrlForTokenId(tokenId) {
    const baseUrl = getBaseUrl('opensea.io', getNetworkName(this.chainId));
    return `${baseUrl}/assets/${this.contractAddress}/${tokenId}`;
  }

  async attributesForTokenId(tokenId) {
    return await this.contract.attributes(tokenId);
  }

  async tokenExists(tokenId) {
    try {
      // method call reverts for non exitance token ID
      await this.contract.productCode(tokenId);
      return true;
    } catch (e) {
      return false;
    }
  }

  async tokenIdForProductId(productId) {
    return await this.contract.tokenIdForProductId(productId);
  }

  async tokenURI(tokenId) {
    return await this.contract.tokenURI(tokenId);
  }

  async getBirthTransaction(tokenId) {
    // From Zero for token ID
    const filter = this.contract.filters.Transfer(constants.AddressZero, null, new utils.BigNumber(tokenId).toHexString());
    filter.fromBlock = 0;
    filter.toBlock = 'latest';

    const events = await this.provider.getLogs(filter);
    const {transactionHash, blockNumber} = events[0];
    return {
      transactionHash,
      blockNumber,
    };
  }

  async totalSupply() {
    return await this.contract.totalSupply();
  }

  async mint(tokenId, recipient, productCode, ipfsHash) {
    return this.contract.mintToken(tokenId, recipient, productCode, ipfsHash);
  }

  async updateIpfsHash(tokenId, ipfsHash) {
    return this.contract.updateIpfsHash(tokenId, ipfsHash);
  }
}

module.exports = TokenLandia;
