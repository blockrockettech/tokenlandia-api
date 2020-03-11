const _ = require('lodash');
const sinon = require('sinon');

const dotenv = require('dotenv');
dotenv.config({path: `./.env.test`, debug: true});

const {JOB_STATUS} = require('../../src/services/job/jobConstants');

const MetadataCreationProcessor = require('../../src/services/processors/metadataCreationProcessor');

describe('Metadata Creation Processor - ', async function () {

  beforeEach(function () {
    this.now = Date.now();
    this.clock = sinon.useFakeTimers(this.now);
  });

  afterEach(function () {
    sinon.restore();
    this.clock.restore();
  });

  describe('Creating new token data and pushing to IPFS', async function () {

    it('Should upload image and push to IPFS', async function () {

      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves('success')
      };

      const ipfsService = {
        uploadImageToIpfs: sinon.stub().onCall(0).resolves('QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf'),
        pushJsonToIpfs: sinon.stub().onCall(0).resolves('QmPPi7piLxpzhcPUX6LSSEBRttS5VSn2AgMAiUtjn5Run9')
      };

      const chainId = 4;
      const jobId = 'abc-123-def-456';
      const imageUrl = 'https://ichef.bbci.co.uk/news/320/cpsprodpb/14C0F/production/_110970058_gettyimages-147807964-1.jpg';

      const job = {
        chainId: chainId,
        jobId: jobId,
        context: {
          [JOB_STATUS.ACCEPTED]: {
            'token_id': 1,
            'coo': 'USA',
            'artist_initials': 'RSA',
            'series': '002',
            'design': '0003',
            'name': 'token 1',
            'description': 'token 1 description',
            'image': imageUrl,
            'artist': 'artist',
            'artist_assistant': 'assistant',
            'brand': 'brand',
            'model': 'model',
            'type': 'PHYSICAL_ASSET',
            'product_id': 'USA-RSA-002-0003-113',
            'product_code': 'USA-RSA-002-0003'
          }
        }
      };

      const processor = new MetadataCreationProcessor(jobQueue, ipfsService);

      const result = await processor.pushCreateTokenJob(job);
      result.should.be.deep.equal('success');

      sinon.assert.calledWith(ipfsService.uploadImageToIpfs, imageUrl);

      sinon.assert.calledWith(ipfsService.pushJsonToIpfs, {
        attributes: {
          artist: 'artist',
          artist_assistant: 'assistant',
          artist_initials: 'RSA',
          brand: 'brand',
          coo: 'USA',
          design: '0003',
          model: 'model',
          product_id: 'USA-RSA-002-0003-113',
          series: '002',
          token_id: 1
        },
        created: Math.floor(this.now / 1000),
        description: 'token 1 description',
        image: 'https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf',
        name: 'token 1',
        type: 'PHYSICAL_ASSET'
      });

      sinon.assert.calledWith(jobQueue.addStatusAndContextToJob, chainId, jobId, JOB_STATUS.METADATA_CREATED, {
        metadata: {
          attributes: {
            artist: 'artist',
            artist_assistant: 'assistant',
            artist_initials: 'RSA',
            brand: 'brand',
            coo: 'USA',
            design: '0003',
            model: 'model',
            product_id: 'USA-RSA-002-0003-113',
            series: '002',
            token_id: 1
          },
          created: Math.floor(this.now / 1000),
          description: 'token 1 description',
          image: 'https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf',
          name: 'token 1',
          type: 'PHYSICAL_ASSET'
        },
        metadataHash: 'QmPPi7piLxpzhcPUX6LSSEBRttS5VSn2AgMAiUtjn5Run9'
      });
    });

  });

  describe('Pushing updated token data to IPFS', async function () {

    it('should merge attributes and push to IPFS', async function () {

      const jobQueue = {
        addStatusAndContextToJob: sinon.stub().onCall(0).resolves('success')
      };

      const ipfsService = {
        pushJsonToIpfs: sinon.stub().onCall(0).resolves('QmPPi7piLxpzhcPUX6LSSEBRttS5VSn2AgMAiUtjn5Run9')
      };

      const chainId = 4;
      const jobId = 'abc-123-def-456';

      const job = {
        chainId: chainId,
        jobId: jobId,
        context: {
          [JOB_STATUS.ACCEPTED]: {
            'token_id': 1,
            'type': 'PHYISCAL_ASSET',
            'purchase_location': 'london',
            'purchase_date': '2020-02-01',
            'customization_location': 'tokyo',
            'customization_date': '2020-02-06',
            'material_1': 'a',
            'material_2': 'b',
          }
        }
      };

      const processor = new MetadataCreationProcessor(jobQueue, ipfsService);

      const result = await processor.pushUpdateTokenJob(job);
      result.should.be.deep.equal('success');

      sinon.assert.calledWith(ipfsService.pushJsonToIpfs, {
        attributes: {
          artist: 'Token 1 Art',
          artist_assistant: 'Token 1 Assistant',
          brand: 'Token 1 Brand',
          coo: 'ASM',
          customization_date: '2020-02-06',
          customization_location: 'tokyo',
          design: '0001',
          initials: 'JSH',
          material_1: 'a',
          material_2: 'b',
          material_3: 'c3',
          model: 'Token 1 Model',
          product_id: 'ASM-JSH-001-0001-1',
          purchase_date: '2020-02-01',
          purchase_location: 'london',
          series: '001',
          token_id: '1',
          type: 'PHYSICAL_ASSET'
        },
        created: 1579181406,
        description: 'Token 1 Desc',
        image: 'https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf',
        name: 'Token 1',
        type: 'PHYSICAL_ASSET'
      });

      sinon.assert.calledWith(jobQueue.addStatusAndContextToJob, chainId, jobId, JOB_STATUS.METADATA_CREATED, {
        metadata: {
          attributes: {
            artist: 'Token 1 Art',
            artist_assistant: 'Token 1 Assistant',
            brand: 'Token 1 Brand',
            coo: 'ASM',
            customization_date: '2020-02-06',
            customization_location: 'tokyo',
            design: '0001',
            initials: 'JSH',
            material_1: 'a',
            material_2: 'b',
            material_3: 'c3',
            model: 'Token 1 Model',
            product_id: 'ASM-JSH-001-0001-1',
            purchase_date: '2020-02-01',
            purchase_location: 'london',
            series: '001',
            token_id: '1',
            type: 'PHYSICAL_ASSET'
          },
          created: 1579181406,
          description: 'Token 1 Desc',
          image: 'https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf',
          name: 'Token 1',
          type: 'PHYSICAL_ASSET'
        },
        metadataHash: 'QmPPi7piLxpzhcPUX6LSSEBRttS5VSn2AgMAiUtjn5Run9'
      });
    });

  });

});
