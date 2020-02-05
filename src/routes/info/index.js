const packageInfo = require('../../../package.json');

const info = require('express').Router({mergeParams: true});

info.get('/', async (req, res, next) => {
  return res
    .status(200)
    .json({
      name: packageInfo.name,
      version: packageInfo.version
    });
});

module.exports = info;
