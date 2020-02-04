const {ethers} = require('ethers');
const TokenLandiaTruffleConf = require('../truffleconf/token/Tokenlandia');
const {getContractAddressFromTruffleConf} = require('../utils/truffle');
const {getNetworkName} = require('@blockrocket/utils');

function getBaseUrl(domain, networkName) {
    if (networkName !== 'mainnet') {
        return `https://${networkName}.${domain}`;
    }
    return `https://${domain}`;
}

class TokenLandia {
    init(chainId, provider) {
        this.chainId = chainId;
        this.provider = provider;
        this.contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, this.chainId);

        if (!this.contractAddress) {
            throw new Error(`No contract exists for chain ID '${chainId}'`);
        }

        this.contract = new ethers.Contract(
            this.contractAddress,
            TokenLandiaTruffleConf.abi,
            this.provider
        );
    }

    etherscanUrlForTokenId(tokenId) {
        const baseUrl = getBaseUrl('etherscan.io', getNetworkName(this.chainId));
        return `${baseUrl}/token/${this.contractAddress}?a=${tokenId}`;
    }

    openSeaUrlForTokenId(tokenId) {
        const baseUrl = getBaseUrl('opensea.io', getNetworkName(this.chainId));
        return `${baseUrl}/assets/${this.contractAddress}/${tokenId}`;
    }

    async attributesForTokenId(tokenId) {
        return await this.contract.attributes(tokenId);
    }

    async tokenIdForProductId(productId) {
        return await this.contract.tokenIdForProductId(productId);
    }

    async totalSupply() {
        return await this.contract.totalSupply();
    }
}

module.exports = new TokenLandia();