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

function etherscanUrlForTokenId(tokenId, chainId) {
    const baseUrl = getBaseUrl('etherscan.io', getNetworkName(chainId));
    const contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, chainId);
    return `${baseUrl}/token/${contractAddress}?a=${tokenId}`;
}

function openSeaUrlForTokenId(tokenId, chainId) {
    const baseUrl = getBaseUrl('opensea.io', getNetworkName(chainId));
    const contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, chainId);
    return `${baseUrl}/assets/${contractAddress}/${tokenId}`;
}

async function attributesForTokenId(tokenId, chainId, provider) {
    const contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, chainId);
    const tokenlandia = new ethers.Contract(
        contractAddress,
        TokenLandiaTruffleConf.abi,
        provider
    );
    return await tokenlandia.attributes(tokenId);
}

async function tokenIdForProductId(productId, chainId, provider) {
    const contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, chainId);
    const tokenlandia = new ethers.Contract(
        contractAddress,
        TokenLandiaTruffleConf.abi,
        provider
    );
    return await tokenlandia.tokenIdForProductId(productId);
}

async function totalSupply(chainId, provider) {
    const contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, chainId);
    const tokenlandia = new ethers.Contract(
        contractAddress,
        TokenLandiaTruffleConf.abi,
        provider
    );
    return await tokenlandia.totalSupply();
}

module.exports = {
    attributesForTokenId,
    tokenIdForProductId,
    totalSupply,
    etherscanUrlForTokenId,
    openSeaUrlForTokenId
};