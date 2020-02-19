const v1 = require('express').Router({mergeParams: true});

const {apiTokenValidator} = require('../middleware');

v1.use('/asset', require('./asset'));

v1.use('/job', apiTokenValidator, require('./job'));

v1.use('/account', apiTokenValidator, require('./account'));

module.exports = v1;
