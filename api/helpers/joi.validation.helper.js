const Joi = require('joi');

const authParamsValidation = {
    registerUser: {
        body: {
            name: Joi.string().min(3).required(),
            email: Joi.string().lowercase().email().required(),
            password: Joi.string().min(6).required(),
            phone: Joi.string().min(6).required(),
            country: Joi.string().required(),
            subscription: Joi.string().regex(/^sub_/, 'subscription Id').required(),
            plan: Joi.string().regex(/^p/, 'plan').required(),
            customerId: Joi.string().regex(/^cus/, 'suctomer Id').required(),
            expiredAt: Joi.number().integer().required()
        }
    },
    loginUser: {
        body: {
            email: Joi.string().lowercase().email().required(),
            password: Joi.string().required()
        }
    }
};

const subscriptionParamsValidation = {
    addPlan: {
        body: {
            productName: Joi.string().required(),
            currency: Joi.string().valid('usd', 'INR').required(),
            amount: Joi.string().required(),
            interval: Joi.string().required(),
            intervalCount: Joi.number().integer().required()
        }
    },
    stripeCustomer: {
        body: {
            name: Joi.string().min(3).required(),
            email: Joi.string().lowercase().email().required(),
            addressLine: Joi.string().required(),
            postal_code: Joi.string().required(),
            city: Joi.string().required(),
            country: Joi.string().required(),
        }
    },
    stripeSubscription: {
        body: {
            customerId: Joi.string().regex(/^cus_/, 'customer Id').required(),
            priceId: Joi.string().regex(/^price_/, 'price Id').required(),
            paymentId: Joi.string().regex(/^pm_/, 'payment Id').required(),
            trialDays: Joi.string().required()
        }
    },
    updateStripeSubscription: {
        body: {
            customerId: Joi.string().regex(/^cus_/, 'customer Id').required(),
            priceId: Joi.string().regex(/^price_/, 'price Id').required(),
            subscriptionId: Joi.string().regex(/^sub_/, 'subscription Id').required()
        }
    },
    disableProducts: {
        body: {
            productId: Joi.string().regex(/^prod_/, 'product Id').required(),
            priceId: Joi.string().regex(/^price_/, 'price Id').required(),
        }
    },
    cancelSubscription: {
        query: {
            subscriptionId: Joi.string().regex(/^sub_/, 'subscription Id').required(),
            gateway: Joi.string().valid('stripe', 'razorpay').insensitive().required()
        }
    },
    razorpayCustomer: {
        body: {
            name: Joi.string().min(3).required(),
            email: Joi.string().lowercase().email().required(),
            contact: Joi.string().required(),
        }
    },
    razorpaySubscription: {
        body: {
            planId: Joi.string().regex(/^plan_/, 'plan Id').required(),
            customerId: Joi.string().regex(/^cust_/, 'customer Id').required(),
            startAt: Joi.string().required(),
            expireBy: Joi.string().required()
        }
    }
};

const tourParamsValidation = {
    createTour: {
        body: {
            name: Joi.string().min(4).required(),
            description: Joi.string().min(10).required(),
            category: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'category').required(),
            portfolioImage: Joi.string().uri().required()
        }
    }
};

const categoryParamsValidation = {
    createCategory: {
        body: {
            name: Joi.string().min(4).required()
        }
    },
    updateCategory: {
        body: {
            isActive: Joi.boolean().required()
        }
    }
};

const faqParamsValidation = {
    createFAQ: {
        body: {
            question: Joi.string().min(5).required(),
            answer: Joi.string().min(5).required()
        }
    },
    updateFAQ: {
        body: {
            question: Joi.string().min(5).required(),
            answer: Joi.string().min(5).required(),
            isActive: Joi.boolean().required()
        }
    },
    searchFAQ: {
        query: {
            question: Joi.string().required(),
        }
    }
};

const productParamsValidation = {
    createProduct: {
        body: {
            name: Joi.string().min(3).required(),
            price: Joi.string().required(),
            quantity: Joi.string().required(),
            category: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'category').required(),
            sourceImage: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'source image').required()
        }
    },
    productByCategory: {
        query: {
            category: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'category').required()
        }
    },
    updateProduct: {
        body: {
            price: Joi.string().required(),
            quantity: Joi.string().required(),
            category: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'category').required(),
            sourceImage: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'source image').required(),
            isActive: Joi.boolean().required()
        }
    }
};

const cartParamsValidation = {
    createCart: {
        body: {
            products: Joi.array().items({
                productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'product Id').required(),
                quantity: Joi.string().required(),
            }).min(1).required()
        }
    },
    updateCart: {
        body: {
            productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'product Id').required(),
            quantity: Joi.string().required()
        }
    }
};

module.exports = {
    authParamsValidation,
    subscriptionParamsValidation,
    tourParamsValidation,
    categoryParamsValidation,
    faqParamsValidation,
    productParamsValidation,
    cartParamsValidation
}
