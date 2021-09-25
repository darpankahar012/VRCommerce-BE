const router = require('express').Router();
const authCtrl = require('../controllers/auth.controller');
const validate = require('express-validation');
const { authParamsValidation } = require('../helpers/joi.validation.helper');

/** POST /api/auth/register - register user */
router.post('/register',
    validate(authParamsValidation.registerUser),
    authCtrl.registerUser
);

/** POST /api/auth/login - login user */
router.post('/login',
    validate(authParamsValidation.loginUser),
    authCtrl.loginUser
);

module.exports = router;
