const router = require('express').Router();
const categoryCtrl = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('express-validation');
const { categoryParamsValidation } = require('../helpers/joi.validation.helper');
const { findCategory } = require('../controllers/common.controller');

router.route('/')
    /** POST /api/category - create category */
    .post(
        protect,
        validate(categoryParamsValidation.createCategory),
        categoryCtrl.createcategory
    )
    /** GET /api/category - list categories */
    .get(
        protect,
        categoryCtrl.listCategories
    );

router.route('/:categoryId')
    /** PATCH /api/category/:categoryId - update category */
    .patch(
        protect,
        validate(categoryParamsValidation.updateCategory),
        findCategory,
        categoryCtrl.updateCategory
    )
    /** DELETE /api/category/:categoryId - delete category */
    .delete(
        protect,
        findCategory,
        categoryCtrl.deleteCategory
    );

module.exports = router;
