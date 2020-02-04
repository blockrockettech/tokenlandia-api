const v1 = require('express').Router({mergeParams: true});

v1.use('/token', require('./token'));

module.exports = v1;