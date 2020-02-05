const TokenLandia = require('./tokenlandia');

module.exports = {
    newTokenLandiaService: (chainId) =>{
        return new TokenLandia(chainId);
    }
};
