const ipfsHttpClient = require('ipfs-http-client');
const {Buffer} = require('buffer/');
const axios = require('axios');

class InfuraIpfsService {
  constructor() {
    this.ipfs = ipfsHttpClient('https://ipfs.infura.io', '5001', {protocol: 'https'});
  }

  async pushBufferToIpfs(buffer, tryingToUpload) {
    try {
      const results = await this.ipfs.add(buffer, {pin: true});

      if (results && Array.isArray(results) && results.length > 0) {
        const result = results[0];
        const hash = result && result.hash ? result.hash : 'unsuccessful';

        if (hash === 'unsuccessful') {
          throw new Error(`Failed to upload ${tryingToUpload} to IPFS due to: No hash returned`);
        }

        return hash;
      }
    } catch (e) {
      throw new Error(`Failed to upload ${tryingToUpload} to IPFS due to: ${e}`);
    }

    throw new Error('unsuccessful');
  }

  // TODO WIP
  async uploadImageToIpfs(fileBuffer) {
    //return this.pushBufferToIpfs(fileBuffer, 'image');
    return 'TODO stream from axios';
  }

  async pushJsonToIpfs(ipfsPayload) {
    const buffer = Buffer.from(JSON.stringify(ipfsPayload));
    return this.pushBufferToIpfs(buffer, 'token data');
  }
}

module.exports = InfuraIpfsService;
