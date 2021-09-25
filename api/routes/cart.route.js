const router = require('express').Router();
const cartCtrl = require('../controllers/cart.controller');
const validate = require('express-validation');
const { cartParamsValidation } = require('../helpers/joi.validation.helper');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
    /** POST /api/cart - add product to cart */
    .post(
        protect,
        validate(cartParamsValidation.createCart),
        cartCtrl.createCart
    )
    /** GET /api/cart - list cart products */
    .get(
        protect,
        cartCtrl.listCartProducts
    )
    /** PATCH /api/cart - update cart product */
    .patch(
        protect,
        validate(cartParamsValidation.updateCart),
        cartCtrl.updateCartProduct
    );

router.route('/:productId')
    /** DELETE /api/cart/:productId - remove product from cart */
    .delete(
        protect,
        cartCtrl.removeCartProduct
    );

module.exports = router;
