const accessTokens = [
  process.env.API_ACCESS_KEY
];

const isValid = (token) => {
  return accessTokens.includes(token);
};

module.exports = (req, res, next) => {

  if (req.query && isValid(req.query.key)) {
    return next();
  }

  console.log('Not authorized to make this call');
  return res.status(403).json({
    'error': 'Please provide a valid API access token'
  });
};
