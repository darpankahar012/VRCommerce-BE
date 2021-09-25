const httpStatus = require('http-status');
const moment = require('moment');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const db = require('../server');
const User = db.collection('users');
const Subscription = db.collection('subscriptions');
const query = require('../query/query');
const { encryptPassword, decryptPassword } = require('../helpers/password.helper');
const { generateJWTAccessToken } = require('../helpers/common.helper');
const { ObjectId } = require('mongodb');

// login user
const loginUser = async (req, res, next) => {
    try {
        const message = 'Invalid login credentials.';
        const { email, password } = req.body;
        // find user and verify email
        let user = await query.findOne(User, { email });
        if (!user) {
            return next(new APIError(message, httpStatus.FORBIDDEN, true));
        }

        // match password
        const isMatched = await decryptPassword(password, user.password);
        if (!isMatched) {
            return next(new APIError(message, httpStatus.FORBIDDEN, true));
        }
        // update subsription expire status
        if (new Date() > user.subscriptionExpiredAt) {
            let result = await query.findOneAndUpdate(User, { _id: ObjectId(user._id) }, {
                $set: { isSubscriptionExpired: true }
            }, { returnOriginal: false });
            user = result.value;
        }

        // get token
        let token = generateJWTAccessToken(user);

        // remove password
        user['password'] = undefined;

        // send response
        let response = { user, token };
        let obj = resPattern.successPattern(httpStatus.OK, response, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// register new user
const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, country, subscription, expiredAt, plan, customerId } = req.body;
        const password = await encryptPassword(req.body.password);
        const currentDate = new Date(moment.unix(expiredAt).format("YYYY-MM-DDThh:mm:ss"));

        // find existing user
        const existingUser = await query.findOne(User, { email });
        if (existingUser) {
            let message = 'You have already registered.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // save user data and verify
        let userObj = {
            name,
            email,
            password,
            phone,
            country,
            registerType: 'user',
            subscription,
            plan,
            isTrialUsed: true,
            customerId,
            isSubscriptionExpired: false,
            isPlanCancelled: false,
            subscriptionCancelledAt: null,
            subscriptionExpiredAt: currentDate
        }
        const user = await query.insert(User, userObj);
        if (user.ops.length < 0) {
            let message = 'Something went wrong while registering user. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // update subscription
        let dbQuery = { 'subscription.id': subscription };
        const userId = user.ops[0]._id;
        await query.findOneAndUpdate(Subscription, dbQuery, { $set: { user: userId } }, { returnOriginal: false });

        // remove password
        user.ops[0]['password'] = undefined;

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, user.ops, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

module.exports = {
    registerUser,
    loginUser
}
