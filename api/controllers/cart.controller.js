const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const db = require('../server');
const Cart = db.collection('carts');
const query = require('../query/query');
const { response } = require('express');

// delete cart product
const removeCartProduct = async (req, res, next) => {
    try {
        const user = ObjectId(req.user._id);
        const productId = ObjectId(req.params.productId);
        let message;
        let cartLenth;

        // find cart and verify
        let cart = await query.findOne(Cart, { user });
        if (cart.products.length === 0) {
            message = 'No product found in you cart.';
            return next(new APIError(message, httpStatus.NOT_FOUND, true));
        }
        // console.log(cart);
        cartLenth = cart.products.length;
        // filter cart products and verify
        const products = cart.products.filter((product) => (product.productId).toString() !== productId.toString());
        if (cartLenth === products.length) {
            message = 'Product not found in your cart.';
            return next(new APIError(message, httpStatus.NOT_FOUND, true));
        }

        // calling function to update product cart
        message = 'Something went wrong while deleting cart. Please try again.';
        let isDelete = true;
        let response = 'Product removed from cart.';
        updateCart(user, products, message, isDelete, response, res, next);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// update cart product
const updateCartProduct = async (req, res, next) => {
    try {
        const user = ObjectId(req.user._id);
        const { productId, quantity, options } = req.body;

        // find products
        let cart = await query.findOne(Cart, { user });
        const products = cart.products;
        let cartProducts = products;

        let newProduct = {};
        let flag = false;
        // filter product and add quantity if already product is available.
        products.map(product => {
            if ((product.productId).equals(ObjectId(productId))) {
                cartProducts = products.filter((product) => (product.productId).toString() !== productId.toString());
                flag = true;
                newProduct = {
                    productId: product.productId,
                    options,
                    quantity: (parseInt(product.quantity) + parseInt(quantity)).toString()
                }
            }
        });
        // merge all products
        if (flag) {
            cartProducts.push(newProduct);
        } else {
            cartProducts.push({
                productId: ObjectId(productId),
                options,
                quantity
            });
        }

        // calling function to update product cart
        let message = 'Something went wrong while updating cart. Please try again.';
        let isDelete = false;
        updateCart(user, cartProducts, message, isDelete, response, res, next);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

async function updateCart(user, products, message, isDelete, response, res, next) {
    try {
        // update cart and verify
        let cart = await query.findOneAndUpdate(Cart, { user },
            {
                $set: {
                    products,
                    updatedAt: new Date()
                }
            },
            {
                returnOriginal: false
            }
        );
        if (cart['ok'] === 0) {
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        response = (isDelete) ? response : cart.value;
        let obj = resPattern.successPattern(httpStatus.OK, response, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// list cart products
const listCartProducts = async (req, res, next) => {
    try {
        const user = ObjectId(req.user._id);
        // find products
        const products = await query.findOne(Cart, { user });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, products, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// add product to cart
const createCart = async (req, res, next) => {
    try {
        const user = ObjectId(req.user._id);
        const products = req.body.products;
        let cartProducts = [];
        let cart;
        let message;

        // find and verify
        cart = await query.findOne(Cart, { user });
        if (cart && cart.products.length > 0) {
            message = 'You have already created cart.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }
        // filter cart products
        products.map(product => {
            cartProducts.push({
                productId: ObjectId(product.productId),
                options: product.options,
                quantity: product.quantity
            });
        });
        // save new cart details
        cart = await query.insert(Cart, {
            products: cartProducts,
            user
        });

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, cart.ops[0], 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

module.exports = {
    createCart,
    listCartProducts,
    updateCartProduct,
    removeCartProduct
}
