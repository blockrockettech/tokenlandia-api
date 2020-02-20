const EscrowContractTruffleConf = require('../../truffleconf/escrow/TrustedNftEscrow');

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

module.exports = {
  getContractAddressFromTruffleConf,
  getEscrowContractAddress
};
