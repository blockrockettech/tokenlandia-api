const {ethers} = require('ethers');
const TokenLandiaTruffleConf = require('../truffleconf/token/Tokenlandia');
const {getContractAddressFromTruffleConf} = require('../utils/truffle');

async function attributesForTokenId(tokenId, chainId, provider) {
    const contractAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, chainId);
    const tokenlandia = new ethers.Contract(
        contractAddress,
        TokenLandiaTruffleConf.abi,
        provider
    );
    return await tokenlandia.attributes(tokenId);
}

module.exports = {
    attributesForTokenId
};