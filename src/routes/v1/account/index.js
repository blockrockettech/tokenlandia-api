const account = require('express').Router({mergeParams: true});

account.get('/:account/balance', async function (req, res) {

  // TODO get account balance of job submitter

});


module.exports = account;
