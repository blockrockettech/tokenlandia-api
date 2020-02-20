const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'test') {
  console.log(`Applying dotenv config for [${process.env.NODE_ENV}]`);
  const result = dotenv.config({path: `./.env.${process.env.NODE_ENV}`});
  if (result.error) throw result.error;
} else {
  console.log(`Applying default dotenv`);
  const result = dotenv.config({path: './.env'});
  if (result.error) throw result.error;
}

const express = require('express');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');

const {chainIdValidator} = require('./routes/middleware');

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(compression());
}

const corsOptions = {
  origin: function (origin, callback) {
    if (origin) {
      console.log('Checking origin', origin);
    }
    // disable all CORS checks for now
    callback(null, {origin: true});
  }
};

app.use('*', cors(corsOptions));
app.use(bearerToken());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', require('./routes/info'));
app.use('/v1/network/:chainId', chainIdValidator, require('./routes/v1'));

// Default error handler for all routes
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.statusCode || 500)
    .json({
      error: {
        name: err.name,
        message: err.message,
        data: err.data,
      },
    });
});

const port = 8080 || process.env.PORT;
app.listen(port, () => console.log(`API started, listening on port [${port}]`));
module.exports = app;
