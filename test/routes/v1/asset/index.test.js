const sinon = require('sinon');
const axios = require('axios');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../src');

const services = require('../../../../src/services');

chai.use(chaiHttp);
chai.should();

function getBaseUrl(chainId) {
  return `/v1/network/${chainId}/asset`;
}

describe('Physical asset token routes', () => {
  afterEach(function () {
    sinon.restore();
  });

  describe('/:assetType/info/:tokenIdOrProductId', () => {
    it('should retrieve token info for a valid token ID', async () => {
      const tokenId = '2';
      const hash = '0x123abc';

      sinon.stub(services, 'newTokenLandiaService').callsFake(() => {
        return {
          async tokenExists(token_id) {
            token_id.should.be.equal(tokenId);
            return Promise.resolve(true);
          },
          attributesForTokenId(token_id) {
            token_id.should.be.equal(tokenId);
            return {
              _productCode: "1",
              _productId: "2",
              _ipfsUrl: "3"
            };
          },
          openSeaUrlForTokenId(token_id) {
            token_id.should.be.equal(tokenId);
            return 'opensea';
          },
          etherscanUrlForTokenId(token_id) {
            token_id.should.be.equal(tokenId);
            return 'etherscan';
          },
          etherscanUrlForTransaction(hash) {
            hash.should.be.equal(hash);
            return `transaction_hash/${hash}`;
          },
          getBirthTransaction(token_id) {
            token_id.should.be.equal(tokenId);
            return {transactionHash: hash};
          },
          tokenURI(token_id) {
            token_id.should.be.equal(tokenId);
            return '3';
          }
        };
      });

      const fakeInfuraResponse = {
        name: '',
        description: '',
        image: '',
        attribute: {
          anAttribute: true
        }
      };

      sinon.stub(axios, 'get').callsFake(async (token_uri) => {
        token_uri.should.be.equal('3');
        return {
          data: fakeInfuraResponse
        };
      });

      const chainId = 4;
      const baseUrl = getBaseUrl(chainId);
      const res = await chai.request(app).get(`${baseUrl}/Tokenlandia/info/${tokenId}`);
      res.should.not.be.empty;
      res.body.should.be.deep.equal({
        _productCode: "1",
        _productId: "2",
        _ipfsUrl: "3",
        'token_id': tokenId,
        'token_uri': '3',
        open_sea_link: 'opensea',
        etherscan_link: 'etherscan',
        transaction_hash: '0x123abc',
        'etherscan_transaction_hash': 'transaction_hash/0x123abc',
        ...fakeInfuraResponse
      });
    });
  });
});
