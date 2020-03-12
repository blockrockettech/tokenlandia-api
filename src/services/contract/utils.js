const {utils} = require('ethers');

function isValidAddress(address) {
  try {
    utils.getAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  isValidAddress
};
