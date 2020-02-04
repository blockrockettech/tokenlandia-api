const {getHttpProvider} = require("../../../web3/provider");
const {attributesForTokenId} = require("../../../services/tokenlandia");

const axios = require('axios');
const token = require('express').Router({mergeParams: true});

token.get('/info/:tokenIdOrProductCode', async function(req, res) {
    const chainId = req.params.chainId;
    const provider = getHttpProvider(chainId);

    const tokenIdOrProductCode = req.params.tokenIdOrProductCode;
    const [
        product_code,
        product_id,
        token_uri
    ] = await attributesForTokenId(tokenIdOrProductCode, chainId, provider);

    const ipfsResponse = await axios.get(token_uri);

    const open_sea_link = 'https://rinkeby.opensea.io/assets/0xD2d84c15Eda5E93aa15f9DDCAA029eaa3f524aDa/1';
    const etherscan_link = 'https://rinkeby.etherscan.io/token/0xD2d84c15Eda5E93aa15f9DDCAA029eaa3f524aDa?a=1';

    res.status(200).json({
        product_code,
        product_id,
        token_uri,
        open_sea_link,
        etherscan_link,
        ...ipfsResponse.data
    });
});

module.exports = token;