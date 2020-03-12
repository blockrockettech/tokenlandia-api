const axios = require('axios');

module.exports = {
  isWithinGasThreshold: async (chainId) => {
    if (chainId === 1) {
      const {data} = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
      const currentPrice = data.average / 10;
      const isWithinThreshold = currentPrice <= process.env.MAX_GAS_PRICE_IN_GWEI;

      if (!isWithinThreshold) {
        console.error(`Threshold limit has reached - current GAS price [${currentPrice}]`);
      } else {
        console.log(`Is within threshold [${isWithinThreshold}] - current GAS price [${currentPrice}]`);
      }
      return isWithinThreshold;
    }
    console.log(`Skipping GAS estimate as running on chain [${chainId}]`);
    return true;
  },
  currentGasPrice: async () => {
    const {data} = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
    return data.average / 10;
  }
};
