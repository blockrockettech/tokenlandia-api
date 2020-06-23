const chai = require('chai');
chai.should();

const TokenLandiaTruffleConf = require('../../../src/truffleconf/token/Tokenlandia');
const {getContractAddressFromTruffleConf} = require('../../../src/utils/truffle');

describe('truffle utils tests', () => {
  it('returns the correct contract address for a given network', () => {
    const rinkebyAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, 4);
    rinkebyAddress.should.be.equal('0xD2d84c15Eda5E93aa15f9DDCAA029eaa3f524aDa');

    const mainnetAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, 1);
    mainnetAddress.should.be.equal('0xc1013ACD27091812F32b59E1D28F08Ad502dAC92');
  });
});
