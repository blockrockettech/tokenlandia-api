const token = require('express').Router({mergeParams: true});

token.get('/info/:tokenIdOrProductCode', function(req, res) {
    res
        .status(200)
        .json({
            msg: 'TODO'
        });
});

module.exports = token;