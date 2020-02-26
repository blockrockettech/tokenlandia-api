const chainUtils = require('../../utils/chain');

module.exports = (req, res, next) => {

  const chainId = req.params.chainId;

  if (chainUtils.isValidChainId(chainId)) {
    return next();
  }

  return res
    .status(400)
    .json({
      'error': `Invalid chain ID [${chainId}]`
    });
};
