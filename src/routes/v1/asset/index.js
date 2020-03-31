const ServiceFactory = require('../../../services');

const axios = require('axios');
const token = require('express').Router({mergeParams: true});

token.get('/info/:tokenIdOrProductId', async function (req, res) {
  const chainId = req.params.chainId;

  let tokenlandia;
  try {
    tokenlandia = ServiceFactory.newTokenLandiaService(chainId);
  } catch (e) {
    return res.status(500).json({
      msg: e.toString()
    });
  }

  const tokenIdOrProductId = req.params.tokenIdOrProductId;
  let tokenId = tokenIdOrProductId;
  if (tokenIdOrProductId.indexOf('-') !== -1) {
    try {
      tokenId = await tokenlandia.tokenIdForProductId(tokenIdOrProductId);
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

  let attributesResponse;
  try {
    attributesResponse = await tokenlandia.attributesForTokenId(tokenId);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      msg: e.reason && e.reason[0] ? e.reason[0] : `Token with ID ${tokenId} not found`
    });
  }

  const [
    product_code,
    product_id,
    token_uri
  ] = attributesResponse;

  const open_sea_link = tokenlandia.openSeaUrlForTokenId(tokenId);
  const etherscan_link = tokenlandia.etherscanUrlForTokenId(tokenId);
  const {transactionHash} = await tokenlandia.getBirthTransaction(tokenId);

  const ipfsResponse = await axios.get(token_uri);

  res.status(200)
    .header('Cache-Control', 'public, max-age=3600, s-maxage=3600') // 1hr cache
    .json({
      product_code,
      product_id,
      token_id: tokenId.toString(),
      token_uri,
      open_sea_link,
      etherscan_link,
      transaction_hash: transactionHash,
      etherscan_transaction_hash: tokenlandia.etherscanUrlForTransaction(transactionHash),
      contract_address: tokenlandia.contractAddress,
      ...ipfsResponse.data
    });
});

module.exports = token;
