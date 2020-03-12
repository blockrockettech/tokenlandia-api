const {getHttpProvider, getWallet} = require('../../../web3/provider');
const {currentGasPrice} = require('../../../web3/gasStation.service');
const {utils} = require('ethers');

const account = require('express').Router({mergeParams: true});

account.get('/balance', async function (req, res) {

  const chainId = req.params.chainId;
  const provider = getHttpProvider(chainId);
  const wallet = getWallet(chainId);
  const apiBalance = utils.formatEther(await provider.getBalance(wallet.address)).toString();

  return res
    .status(200)
    .json({
      balance: `${apiBalance} ETH`,
      address: `${wallet.address}`,
      currentGasPrice: `${await currentGasPrice()} GWEI`,
      currentGasThreshold: `${process.env.MAX_GAS_PRICE_IN_GWEI} GWEI`
    });

});


module.exports = account;
