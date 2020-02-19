const ipfsHttpClient = require('ipfs-http-client');
const {Buffer} = require('buffer/');
const axios = require('axios');

class InfuraIpfsService {
  constructor(baseIpfsUrl, port, options) {
    this.baseIpfsUrl = baseIpfsUrl;
    this.ipfs = ipfsHttpClient(baseIpfsUrl, port, options);
  }

  async pushToIpfs(addArgs, tryingToUpload) {
    try {
      const results = await this.ipfs.add(...addArgs);

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

  async pushBufferToIpfs(buffer, tryingToUpload) {
    return this.pushToIpfs([buffer, {pin: true}], tryingToUpload);
  }

  async pushStreamToIpfs(stream, tryingToUpload) {
    return this.pushToIpfs([{pin: true, content: stream}], tryingToUpload);
  }

  // TODO WIP
  async uploadImageToIpfs(url) {
    const stream = await axios({
      method: 'get',
      url,
      responseType: 'stream'
    });

    return this.pushStreamToIpfs(stream, 'image');
  }

  async pushJsonToIpfs(ipfsPayload) {
    const buffer = Buffer.from(JSON.stringify(ipfsPayload));
    return this.pushBufferToIpfs(buffer, '721 token meta-data');
  }

  getBaseUrl() {
    return this.baseIpfsUrl;
  }
}

module.exports = InfuraIpfsService;
