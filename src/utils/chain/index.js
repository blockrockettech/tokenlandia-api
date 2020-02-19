const isValidChainId = (chainId) => {
  return ['4', '1'].includes(chainId.toString());
};

module.exports = {
  isValidChainId
};
