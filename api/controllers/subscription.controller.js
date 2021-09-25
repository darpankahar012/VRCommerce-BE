require('dotenv').config()
const httpStatus = require('http-status');
const Razorpay = require('razorpay');
const moment = require('moment');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const db = require('../server');
const Plan = db.collection('plans');
const Subscription = db.collection('subscriptions');
const User = db.collection('users');
const query = require('../query/query');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++++
 *   +          RAZORPAY SUBSCRIPTION             +
 * ++++++++++++++++++++++++++++++++++++++++++++++++++
 */
let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// confirm razor pay subscription
const confirmSubscription = async (req, res, next) => {
    try {
        const subscriptionId = req.params.subscriptionId;
        // find subscription by subscriptionId and verify
        const subscription = await instance.subscriptions.fetch(subscriptionId);
        if (subscription.status !== 'authenticated') {
            let message = 'Subscription amount is not paid.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // save subscription
        const result = await query.insert(Subscription, { subscription });

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, result.ops[0], 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// create razorpay subscription
const razorpaySubscription = async (req, res, next) => {
    try {
        const { planId, startAt, customerId, expireBy, noteKey } = req.body;
        const params = {
            plan_id: planId,
            total_count: 1,
            quantity: 1,
            customer_id: customerId,
            customer_notify: 1,
            start_at: startAt,
            expire_by: expireBy,
            addons: [],
            notes: {
                notes_key_1: noteKey,
            }
        }
        // create subscription
        const subscription = await instance.subscriptions.create(params);

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, subscription, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.error.description, httpStatus.BAD_REQUEST, true));
    }
}

// create razorpay customer
const razorpayCustomer = async (req, res, next) => {
    try {
        const { name, email, contact } = req.body;
        // save customer details
        const customer = await instance.customers.create({
            name,
            email,
            contact
        });

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, customer, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        console.log(e);
        return next(new APIError(e.error.description, httpStatus.BAD_REQUEST, true));
    }
}

/**
 * ++++++++++++++++++++++++++++++++++++++++++++++++
 *   +          STRIPE SUBSCRIPTION             +
 * ++++++++++++++++++++++++++++++++++++++++++++++++
 */
// create stripe subscription
const stripeSubscription = async (req, res, next) => {
    try {
        const { customerId, priceId, paymentId, trialDays } = req.body;

        // payment attachment
        await stripe.paymentMethods.attach(paymentId, {
            customer: customerId,
        });

        // Change the default invoice settings on the customer to the new payment method
        await stripe.customers.update(
            customerId,
            {
                invoice_settings: {
                    default_payment_method: paymentId,
                },
            }
        );

        // create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
            trial_period_days: trialDays
        });

        // save subscription
        const result = await query.insert(Subscription, { subscription, isCancel: false });

        // send response
        const obj = resPattern.successPattern(httpStatus.OK, result.ops[0], `success`);
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// create stripe customer
const stripeCustomer = async (req, res, next) => {
    try {
        const { name, email, addressLine, postal_code, city, country } = req.body;
        // save customer details
        const customer = await stripe.customers.create({
            name,
            email,
            address: {
                line1: addressLine,
                postal_code,
                city,
                country
            }
        });

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, customer, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// update stripe subscription
const updateStripeSubscription = async (req, res, next) => {
    try {
        const { subscriptionId, customerId, priceId } = req.body;

        // update subscription with new price
        const subscription = await stripe.subscriptions.update(
            subscriptionId,
            {
                cancel_at_period_end: true,
            }
        );

        // const addedDay = moment.unix(subscription.cancel_at).utc().add(1, 'days');
        const addedDay = moment.unix(subscription.cancel_at).utc();
        const addedDayUnix = moment.utc(addedDay).unix();

        // schedule subscription
        const subscriptionSchedule = await stripe.subscriptionSchedules.create({
            customer: customerId,
            start_date: addedDayUnix,
            end_behavior: 'release',
            phases: [
                {
                    items: [{ price: priceId }],
                }
            ],
            default_settings: {
                billing_cycle_anchor: 'phase_start',
            }
        });

        // update database
        await query.findOneAndUpdate(Subscription,
            {
                'subscription.id': subscriptionId
            },
            {
                $set: {
                    isCancel: true,
                    cancel_at: subscription.cancel_at
                }
            },
            {
                returnOriginal: false
            }
        );

        // send response
        let response = {
            cancelSubscription: subscription,
            updatedSubscription: subscriptionSchedule
        }
        let obj = resPattern.successPattern(httpStatus.OK, response, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// disable stripe products
const disableProducts = async (req, res, next) => {
    try {
        const { productId, priceId } = req.body;

        // update product status
        await stripe.products.update(
            productId,
            { active: false }
        );

        // update plan
        await query.findOneAndUpdate(Plan, { productId }, { $set: { isDisabled: true } });

        // find subscriptions
        let subscriptions = await query.find(Subscription,
            {
                'subscription.plan.id': priceId
            }
        );
        // filter subscriptions and update user status
        subscriptions.map(async (subs) => {
            const subscriptionId = subs.subscription.id;
            let subsRetriveResult = await stripe.subscriptions.retrieve(subscriptionId);
            let expireDate = moment.unix(subsRetriveResult.current_period_end).format("YYYY-MM-DDThh:mm:ss");

            await query.updateMany(User, { subscription: subscriptionId },
                {
                    $set: {
                        isPlanCancelled: true,
                        subscriptionExpiredAt: new Date(expireDate)
                    }
                }
            )
        });

        // send response
        let successMessage = 'Product disabled successfully.';
        let obj = resPattern.successPattern(httpStatus.OK, { successMessage }, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// add stripe new product
const addStripeProduct = async (req, res, next) => {
    try {
        const { productName, currency, amount, interval, intervalCount, description } = req.body;
        let message;

        // create product and verify
        const product = await stripe.products.create({
            name: productName,
        });
        if (!product) {
            message = 'Something went wrong while creating product. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // create price
        const price = await stripe.prices.create({
            unit_amount: amount * 100,
            currency,
            recurring: {
                interval: interval,
                interval_count: intervalCount
            },
            product: product.id,
        });
        if (!price) {
            message = 'Something went wrong while creating price. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // add price into database
        const plan = await query.insert(Plan, {
            gateway: 'stripe',
            name: productName,
            productId: product.id,
            priceId: price.id,
            currency,
            amount,
            duration: interval,
            trialDays: "14",
            isDisabled: false,
            description
        });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, plan.ops[0], 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// get user subscription details
const fetchSubscription = async (req, res, next) => {
    try {
        const subscriptionId = req.user.subscription;

        // retrieve subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, subscription, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

/**
 * +++++++++++++++++++++++++++++++++++
 *   +          COMMON             +
 * +++++++++++++++++++++++++++++++++++
 */
// list subscription plans
const listPlans = async (req, res, next) => {
    try {
        const gateway = req.params.gateway;
        // find plans
        const plans = await query.find(Plan, { gateway, isDisabled: false });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, plans, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// cancel payment subscription
const cancelSubscription = async (req, res, next) => {
    try {
        const { subscriptionId, gateway } = req.query;
        const errorMessage = 'Something went wrong while cancelling subscription. Please try again.';

        if (gateway === 'razorpay') {
            // delete subscription from razorpay dashboard and verify
            const subscription = await instance.subscriptions.cancel(subscriptionId);
            if (subscription.status !== 'cancelled') {
                return next(new APIError(errorMessage, httpStatus.BAD_REQUEST, true));
            }
        } else {
            // delete subscription from stripe dashboard and verify
            const response = await stripe.subscriptions.del(subscriptionId);
            if (response.status !== 'canceled') {
                return next(new APIError(errorMessage, httpStatus.BAD_REQUEST, true));
            }
        }

        // delete subscription from database
        let dbQuery = {
            'subscription.id': subscriptionId
        }
        await query.deleteOne(Subscription, dbQuery);
        await query.findOneAndUpdate(User, { subscription: subscriptionId },
            {
                $set: { subscriptionCancelledAt: new Date() }
            }
        );
        // send response
        let message = 'Subscription canceled.';
        let obj = resPattern.successPattern(httpStatus.OK, { message }, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        console.log(e);
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// stripe webhook events
const stripeWebhookManagement = async (req, res, next) => {
    let event = req.body;

    // Handle the event
    switch (event.type) {
        case 'subscription_schedule.updated':
            // retrieve susbscription from stripe dashboard
            const subscriptionId = event.data.object.subscription;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const customerId = subscription.customer;
            const currentPeriodEnd = subscription.current_period_end;
            const expiredAt = new Date(moment.unix(currentPeriodEnd).format("YYYY-MM-DDThh:mm:ss"));
            // update user details
            const user = await query.findOneAndUpdate(User, { customerId },
                {
                    $set: {
                        subscription: subscription.id,
                        subscriptionExpiredAt: expiredAt,
                        isPlanCancelled: false,
                        subscriptionCancelledAt: null,
                        plan: subscription.items.data[0].plan.id,
                        updatedAt: new Date()
                    }
                }
            );

            // save subscription
            await query.insert(Subscription, { subscription, isCancel: false, user: user.value._id });
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ event: true });
}

module.exports = {
    listPlans,
    stripeCustomer,
    stripeSubscription,
    updateStripeSubscription,
    disableProducts,
    addStripeProduct,
    fetchSubscription,
    stripeWebhookManagement,
    cancelSubscription,
    razorpayCustomer,
    razorpaySubscription,
    confirmSubscription
}
