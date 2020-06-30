const chai = require('chai');
chai.should();

const TokenLandiaTruffleConf = require('../../../src/truffleconf/token/Tokenlandia');
const {getContractAddressFromTruffleConf} = require('../../../src/utils/truffle');

describe('truffle utils tests', () => {
  it('returns the correct contract address for a given network', () => {
    const rinkebyAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, 4);
    rinkebyAddress.should.be.equal('0x1507264696c07500CB4def01C682c406e97C8482');

    const mainnetAddress = getContractAddressFromTruffleConf(TokenLandiaTruffleConf, 1);
    mainnetAddress.should.be.equal('0xc1013ACD27091812F32b59E1D28F08Ad502dAC92');
  });
});
