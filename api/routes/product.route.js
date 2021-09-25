const router = require('express').Router();
const productCtrl = require('../controllers/product.controller');
const validate = require('express-validation');
const { productParamsValidation } = require('../helpers/joi.validation.helper');
const { protect } = require('../middleware/auth.middleware');
const { findProduct } = require('../controllers/common.controller');

router.route('/')
    /** POST /api/product- create new product */
    .post(
        protect,
        validate(productParamsValidation.createProduct),
        productCtrl.createProduct
    )
    /** GET /api/product- list all products */
    .get(
        protect,
        productCtrl.listProducts
    );

router.route('/:productId')
    /** PATCH /api/product/:productId - update product details */
    .patch(
        protect,
        validate(productParamsValidation.updateProduct),
        findProduct,
        productCtrl.updateProduct
    )
    /** DELETE /api/product/:productId - delete product */
    .delete(
        protect,
        findProduct,
        productCtrl.deleteProduct
    );

/** GET /api/product - list products by category */
router.get('/search',
    protect,
    validate(productParamsValidation.productByCategory),
    productCtrl.productByCategory
);

module.exports = router;
