const _ = require('lodash');

const chai = require('chai');
chai.should();

const gasStation = require('../../src/web3/gasStation.service');

describe('GasStation tests', function () {

  it('Should always report failure with max gas of 0', async function () {
    process.env.MAX_GAS_PRICE_IN_GWEI = 0;
    const result = await gasStation.isWithinGasThreshold(1);
    result.should.be.eq(false);
  });

  it('Should always report success with max gas of 10000', async function () {
    process.env.MAX_GAS_PRICE_IN_GWEI = 10000;
    const result = await gasStation.isWithinGasThreshold(1);
    result.should.be.eq(true);
  });

});
