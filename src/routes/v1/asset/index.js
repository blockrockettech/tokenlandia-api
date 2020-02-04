const {getHttpProvider} = require("../../../web3/provider");
const {attributesForTokenId} = require("../../../services/tokenlandia");

const token = require('express').Router({mergeParams: true});

token.get('/info/:tokenIdOrProductCode', async function(req, res) {
    const chainId = req.params.chainId;
    const provider = getHttpProvider(chainId);

    const tokenIdOrProductCode = req.params.tokenIdOrProductCode;

    res.status(200).json(await attributesForTokenId(tokenIdOrProductCode, chainId, provider));
});

module.exports = token;