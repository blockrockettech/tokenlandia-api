const sinon = require('sinon');
const axios = require('axios');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../src');

const tokenlandiaService = require("../../../../src/services/tokenlandia");

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

           // To silence ethers
           sinon.stub(tokenlandiaService, 'init').callsFake(() => {});

           //
           sinon.stub(tokenlandiaService, 'attributesForTokenId').callsFake(async (token_id) => {
               token_id.should.be.equal(tokenId);
               return [
                   '1',
                   '2',
                   '3'
               ];
           });

           const fakeInfuraResponse = {
               name: '',
               description: '',
               image: '',
               attribute: {
                   anAttribute: true
               }
           };

           sinon.stub(tokenlandiaService, 'openSeaUrlForTokenId').callsFake(token_id => {
               token_id.should.be.equal(tokenId);
               return 'opensea';
           });

           sinon.stub(tokenlandiaService, 'etherscanUrlForTokenId').callsFake(token_id => {
               token_id.should.be.equal(tokenId);
               return 'etherscan';
           });

           //
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
              ...fakeInfuraResponse
           });
       });
    });
});