const EscrowContractTruffleConf = require('../../truffleconf/escrow/TrustedNftEscrow');
const TokenlandiaConf = require('../../truffleconf/token/Tokenlandia');

function getContractAddressFromTruffleConf(truffleConf, chainId) {
  if (!truffleConf || !chainId) return '';

  const {networks} = truffleConf;

  if (networks[chainId.toString()]) {
    const address = networks[chainId.toString()].address;
    return address ? address : '';
  }
  return '';
}

const getEscrowContractAddress = (chainId) => {
  return getContractAddressFromTruffleConf(EscrowContractTruffleConf, chainId);
};

const getTokenLandiaContractAddress = (chainId) => {
  return getContractAddressFromTruffleConf(TokenlandiaConf, chainId);
};

module.exports = {
  getContractAddressFromTruffleConf,
  getEscrowContractAddress,
  getTokenLandiaContractAddress,
};
