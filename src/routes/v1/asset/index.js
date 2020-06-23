const ServiceFactory = require('../../../services');

const axios = require('axios');
const token = require('express').Router({mergeParams: true});

token.get('/:assetType/info/:tokenIdOrProductId', async function (req, res) {
  const {chainId, assetType} = req.params;

  let token;

  // Load the correct token
  if (assetType === 'Tokenlandia') {
    try {
      token = ServiceFactory.newTokenLandiaService(chainId);
    } catch (e) {
      return res.status(500).json({
        msg: e.toString()
      });
    }
  } else {
    try {
      token = ServiceFactory.newVideoLatinoService(chainId);
    } catch (e) {
      return res.status(500).json({
        msg: e.toString()
      });
    }
  }

  const tokenIdOrProductId = req.params.tokenIdOrProductId;
  let tokenId = tokenIdOrProductId;
  if (tokenIdOrProductId.indexOf('-') !== -1) {
    try {
      tokenId = await token.tokenIdForProductId(tokenIdOrProductId);
    } catch (e) {
      return res.status(500).json({
        msg: `Token with product ID ${tokenIdOrProductId} not found`
      });
    }
  }

  if (isNaN(tokenId)) {
    return res.status(500).json({
      msg: `Invalid token ID '${tokenId}'. Please supply the ID number or the token's product ID.`
    });
  }

  if (!(await token.tokenExists(tokenId))) {
    return res.status(500).json({
      msg: e.reason && e.reason[0] ? e.reason[0] : `Token with ID ${tokenId} not found`
    });
  }

  const attributesResponse = await token.attributesForTokenId(tokenId);
  const token_uri = await token.tokenURI(tokenId);

  const open_sea_link = token.openSeaUrlForTokenId(tokenId);
  const etherscan_link = token.etherscanUrlForTokenId(tokenId);
  const {transactionHash} = await token.getBirthTransaction(tokenId);

  const ipfsResponse = await axios.get(token_uri);

  res.status(200)
    .header('Cache-Control', 'public, max-age=3600, s-maxage=3600') // 1hr cache
    .json({
      ...attributesResponse,
      token_id: tokenId.toString(),
      token_uri,
      open_sea_link,
      etherscan_link,
      transaction_hash: transactionHash,
      etherscan_transaction_hash: token.etherscanUrlForTransaction(transactionHash),
      contract_address: token.contractAddress,
      ...ipfsResponse.data
    });
});

module.exports = token;
