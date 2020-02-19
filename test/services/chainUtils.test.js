const _ = require('lodash');

const chai = require('chai');
chai.should();

const {isValidChainId} = require('../../src/utils/chain');

describe('chainUtils', function () {

  it('rinkeby ID 4 is valid', async function () {
    isValidChainId(4).should.be.equal(true);
  });

  it('mainnet ID 1 is valid', async function () {
    isValidChainId(1).should.be.equal(true);
  });

  it('unknown ID 99 is not valid', async function () {
    isValidChainId(99).should.be.equal(false);
  });

});
