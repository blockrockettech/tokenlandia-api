const Web3 = require('web3');
const {getNetworkName} = require('@blockrocket/utils');
const {ethers} = require('ethers');

const httpProviderWeb3 = {};

const getHttpProvider = chainId => {
  if (httpProviderWeb3[chainId]) {
    return httpProviderWeb3[chainId];
  }

  let provider = new ethers.providers.Web3Provider(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

  if (chainId !== 5777) {
    provider = ethers.getDefaultProvider(getNetworkName(chainId));
  }

  httpProviderWeb3[chainId] = provider;
  return httpProviderWeb3[chainId];
};

module.exports = {
  getHttpProvider
};
