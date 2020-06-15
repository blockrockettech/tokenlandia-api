const InfuraIpfsService = require('../../src/services/ipfs/infura.ipfs.service');

const chai = require('chai');
const should = chai.should();

describe('Infura IPFS test', async function () {

  it('should reject with error when image URL is invalid', async function () {
    const client = new InfuraIpfsService();
    let result;
    try {
      result = await client.uploadImageToIpfs('http://invalid.image');
    } catch (e) {
      e.message.should.equal('IMAGE_URL_INVALID');
    }
    should.not.exist(result);
  });

});
