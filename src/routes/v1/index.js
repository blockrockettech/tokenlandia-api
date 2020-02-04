const v1 = require('express').Router({mergeParams: true});

v1.use('/asset', require('./asset'));

module.exports = v1;