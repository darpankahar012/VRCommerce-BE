const router = require('express').Router();
const subscriptionCtrl = require('../controllers/subscription.controller');
const validate = require('express-validation');
const { subscriptionParamsValidation } = require('../helpers/joi.validation.helper');
const { protect } = require('../middleware/auth.middleware');

// webhook routes
router.post('/webhook', subscriptionCtrl.stripeWebhookManagement);

// COMMON
/** POST /api/subscription/plan - add subscription plan */
router.post('/plan',
    validate(subscriptionParamsValidation.addPlan),
    subscriptionCtrl.addStripeProduct
);

/** GET /api/subscription/plan - list subscription plans */
router.get('/plan/:gateway', subscriptionCtrl.listPlans);

/** DELETE /api/subscription/cancel - cancel subscription */
router.delete('/cancel',
    protect,
    validate(subscriptionParamsValidation.cancelSubscription),
    subscriptionCtrl.cancelSubscription
);

// STRIPE SUBSCRIPTION
/** POST /api/subscription/stripe/customer - create stripe customer */
router.post('/stripe/customer',
    validate(subscriptionParamsValidation.stripeCustomer),
    subscriptionCtrl.stripeCustomer
);

router.route('/stripe')
    /** POST /api/subscription/stripe - create stripe subscription */
    .post(
        validate(subscriptionParamsValidation.stripeSubscription),
        subscriptionCtrl.stripeSubscription
    )
    /** PATCH /api/subscription/stripe - update stripe subscription */
    .patch(
        protect,
        validate(subscriptionParamsValidation.updateStripeSubscription),
        subscriptionCtrl.updateStripeSubscription
    );

/** POST /api/subscription/stripe/disable-products - disable stripe products */
router.post('/stripe/disable-products',
    protect,
    validate(subscriptionParamsValidation.disableProducts),
    subscriptionCtrl.disableProducts
);

/** GET /api/subscription/stripe/fetch- fetch stripe subscription */
router.get('/stripe/fetch',
    protect,
    subscriptionCtrl.fetchSubscription
);

// RAZORPAY SUBSCRIPTION
/** POST /api/subscription/razorpay/customer - create razorpay customer */
router.post('/razorpay/customer',
    validate(subscriptionParamsValidation.razorpayCustomer),
    subscriptionCtrl.razorpayCustomer
);

/** POST /api/subscription/razorpay - create razorpay subscription */
router.post('/razorpay',
    validate(subscriptionParamsValidation.razorpaySubscription),
    subscriptionCtrl.razorpaySubscription
);

/** GET /api/subscription/razorpay/confirm/:subscriptionId - confirm razor pay subscription */
router.get('/razorpay/confirm/:subscriptionId', subscriptionCtrl.confirmSubscription);

module.exports = router;
