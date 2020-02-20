const _ = require('lodash');
const axios = require('axios');

class InfuraIpfsService {

  constructor(baseIpfsUrl, ipfsClient) {
    this.baseIpfsUrl = baseIpfsUrl;
    this.ipfs = ipfsClient;
  }

  getBaseUrl() {
    return this.baseIpfsUrl;
  }

  async uploadImageToIpfs(url) {
    console.log('Uploading image from ULR to IPFS', url);

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });

    return this._pushToIpfs({
      pin: true,
      content: response.data
    });
  }

  async pushJsonToIpfs(ipfsPayload) {
    const buffer = Buffer.from(JSON.stringify(ipfsPayload));
    return this._pushToIpfs({
      pin: true,
      content: buffer
    });
  }

  async _pushToIpfs(config) {
    const results = await this.ipfs.add(config);
    const hash = _.get(results, '[0].hash');

    if (!hash) {
      throw new Error(`Failed to upload to IPFS due to: No hash returned`);
    }

    return hash;
  }

}

module.exports = InfuraIpfsService;
