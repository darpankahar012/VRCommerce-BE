require('dotenv').config()
const jwt = require('jsonwebtoken');

const generateJWTAccessToken = (user) => {
    return jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.TOKEN_SECRET);
}

module.exports = {
    generateJWTAccessToken
}
