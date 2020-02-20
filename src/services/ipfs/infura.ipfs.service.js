const ipfsHttpClient = require('ipfs-http-client');
const {Buffer} = require('buffer/');
const axios = require('axios');

class InfuraIpfsService {
  constructor(host, port, options) {
    this.baseIpfsUrl = 'https://ipfs.infura.io';
    this.ipfs = ipfsHttpClient({
      host: 'ipfs.infura.io',
      port: '5001',
      protocol: 'https'
    });
  }

  async pushBufferToIpfs(buffer, tryingToUpload) {
    return this._pushToIpfs([buffer, {pin: true}], tryingToUpload);
  }

  async pushStreamToIpfs(stream, tryingToUpload) {
    return this._pushToIpfs([{pin: true, content: stream}], tryingToUpload);
  }

  // TODO WIP
  async uploadImageToIpfs(url) {
    console.log('url', url);
    const response = await axios.get(url, {
      responseType: 'arrayBuffer'
    });

    const buffer = Buffer.from(response.data, 'binary');
    //console.log('response.data', response.data)
    const results = await this.ipfs.add(buffer, { pin: true });
    console.log('ressults', results);
    return this.pushBufferToIpfs(buffer, 'image');
  }

  async pushJsonToIpfs(ipfsPayload) {
    const buffer = Buffer.from(JSON.stringify(ipfsPayload));
    return this.pushBufferToIpfs(buffer, '721 token meta-data');
  }

  getBaseUrl() {
    return this.baseIpfsUrl;
  }

  async _pushToIpfs(addArgs, tryingToUpload) {
    try {
      console.log('add args', addArgs)
      const results = await this.ipfs.add(...addArgs);

      console.log('results', results);
      console.log('result', results[0]);

      if (results && Array.isArray(results) && results.length > 0) {

        const result = results[0];
        const hash = result && result.hash ? result.hash : 'unsuccessful';

        if (hash === 'unsuccessful') {
          throw new Error(`Failed to upload ${tryingToUpload} to IPFS due to: No hash returned`);
        }

        return hash;
      }

    } catch (e) {
      console.log(e);
      throw new Error(`Failed to upload ${tryingToUpload} to IPFS due to: ${e}`);
    }

    throw new Error(`Failed to upload ${tryingToUpload} to IPFS due to: Result being null`);
  }
}

module.exports = InfuraIpfsService;
