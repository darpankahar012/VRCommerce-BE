require('dotenv').config();
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError.helper');
const db = require('../server');
const User = db.collection('users');
const query = require('../query/query');

const protect = async (req, res, next) => {
    let token;
    let message = 'Not authorized to access this route.';

    // check header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // check token
    if (!token) {
        return next(new APIError(message, httpStatus.UNAUTHORIZED, true));
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await query.findOne(User, { email: decoded.email });
        if (!user) {
            let msg = 'The user belonging to this token does not exist.';
            return next(new APIError(msg, httpStatus.FORBIDDEN, true));
        }
        req.user = user;
        next();
    } catch (e) {
        return next(new APIError(message, httpStatus.UNAUTHORIZED, true));
    }
}

module.exports = { protect };
