const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/v1', require('./routes/v1'));

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

const port = 3000 || process.env.PORT;
app.listen(port, () => console.log(`API started, listening on port [${port}]`));
module.exports = app;