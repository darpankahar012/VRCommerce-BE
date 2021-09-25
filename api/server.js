const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const bodyParser = require('body-parser');
const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const db = require('./config/database');
const APIError = require('./helpers/APIError.helper');
const fs = require('fs');

let dir = './public/images';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const port = process.env.PORT || 9001;
const app = express();

// set morgan logs onto the server...
if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
} else {
    app.use(logger('tiny'));
}
// set body parser...
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

// set view engine
app.set('view engine', 'ejs');

// set cors...
app.use(cors());

// set helmet to protect server from malicious attacks...
app.use(helmet());

// prevent XSS attack
app.use(xss());

// prevent http param pollution
app.use(hpp());

db.connection().then((database) => {
    module.exports = database;

    // api routes
    app.use('/api/auth', require('./routes/auth.route'));
    app.use('/api/subscription', require('./routes/subscription.route'));
    app.use('/api/common', require('./routes/common.route'));
    app.use('/api/tour', require('./routes/tour.route'));
    app.use('/api/category', require('./routes/category.route'));
    app.use('/api/faq', require('./routes/faq.route'));
    app.use('/api/product', require('./routes/product.route'));
    app.use('/api/cart', require('./routes/cart.route'));
    app.get('/', (req, res) => {
        res.render('index');
    });

    // validate errors
    app.use((err, req, res, next) => {
        if (err instanceof expressValidation.ValidationError) {
            // validation error contains errors which is an array of error each containing message[]
            const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
            const error = new APIError(unifiedErrorMessage, err.status, true);
            return next(error);
        } else if (!(err instanceof APIError)) {
            const apiError = new APIError(err.message, err.status, err.name === 'UnauthorizedError' ? true : err.isPublic);
            return next(apiError);
        }
        return next(err);
    });

    // validate unknown routes
    app.use((req, res, next) => {
        const err = new APIError('API Not Found', httpStatus.NOT_FOUND, true);
        return next(err);
    });

    app.use((err, req, res, next) => {
        res.status(err.status).json({
            error: {
                message: err.isPublic ? err.message : httpStatus[err.status],
            }
        });
    });

    // running server
    app.listen(port, () => {
        console.log(`VReality server running on: ${port}.`);
    });
});
