const chai = require('chai');
chai.should();

const ipfsClient = require('../../src/services/ipfs/ipfsClient');
const IpfsService = require('../../src/services/ipfs/infura.ipfs.service');
const MetadataCreationProcessor = require('../../src/services/processors/metadataCreationProcessor');

describe.skip('Metadata creation', function () {

  beforeEach(() => {
  });

  it('creates metadata', async function () {
    const chainId = 4;
    const jobId = 1;
    const mockJobQueue = {
      getJobForId(_chainId, _jobId) {
        _chainId.should.be.equal(chainId);
        _jobId.should.be.equal(jobId);
        return {
          // Job data
          chainId,
          tokenId: '5',
          status: 'CREATED',
          jobType: 'CREATE_TOKEN',
          createdDate: Date.now(),
          attempts: 0,

          // The actual payload
          data: {
            token_id: 100,
            coo: 'USA',
            artist_initials: 'RSA',
            series: 2,
            design: 3,
            name: 'token 1',
            description: 'token 1 description',
            image: 'http://preview.tokenlandia.com/wp-content/uploads/2019/11/b8e4d509cb644e254fbc16eb6a53fd48_listingImg_IOznWUjgk6.jpg',
            artist: 'artist',
            artist_assistant: 'assistant',
            brand: 'brand',
            model: 'model',
            purchase_location: 'london',
            purchase_date: '2020-02-01',
            customization_location: 'tokyo',
            customization_date: '2020-02-06',
            material_1: 'a',
            material_2: 'b',
            type: 'PHYSICAL_ASSET',
            product_id: 'USA-RSA-002-0003-100'
          }
        };
      }
    };

    const ipfsService = new IpfsService(ipfsClient);
    const metadataCreationProcessor = new MetadataCreationProcessor(mockJobQueue, ipfsService);

    await metadataCreationProcessor.processJob(chainId, jobId);
  });
});
