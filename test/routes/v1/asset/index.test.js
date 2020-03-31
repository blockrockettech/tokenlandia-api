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

  describe('/info/:tokenIdOrProductId', () => {
    it('should retrieve token info for a valid token ID', async () => {
      const tokenId = '2';
      const hash = '0x123abc';

      sinon.stub(services, 'newTokenLandiaService').callsFake(() => {
        return {
          attributesForTokenId(token_id) {
            token_id.should.be.equal(tokenId);
            return [
              '1',
              '2',
              '3'
            ];
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
      const res = await chai.request(app).get(`${baseUrl}/info/${tokenId}`);
      res.should.not.be.empty;
      res.body.should.be.deep.equal({
        'product_code': '1',
        'product_id': '2',
        'token_uri': '3',
        'token_id': tokenId,
        open_sea_link: 'opensea',
        etherscan_link: 'etherscan',
        transaction_hash: '0x123abc',
        'etherscan_transaction_hash': 'transaction_hash/0x123abc',
        ...fakeInfuraResponse
      });
    });
  });
});
