const Web3 = require('web3');
const {getNetworkName} = require('@blockrocket/utils');
const { ethers } = require('ethers');

const httpProviderWeb3 = {};

const getHttpProvider = (network) => {
    if (httpProviderWeb3[network]) {
        return httpProviderWeb3[network];
    }

    let provider = new ethers.providers.Web3Provider(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

    if (network != 5777) {
        provider = ethers.getDefaultProvider(getNetworkName(network));
    }

    httpProviderWeb3[network] = provider;
    return httpProviderWeb3[network];
};

module.exports = {
    getHttpProvider
};
