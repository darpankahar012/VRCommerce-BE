const router = require('express').Router();
const faqCtrl = require('../controllers/faq.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('express-validation');
const { faqParamsValidation } = require('../helpers/joi.validation.helper');
const { findFAQ } = require('../controllers/common.controller');

router.route('/')
    /** POST /api/faq - create FAQ */
    .post(
        protect,
        validate(faqParamsValidation.createFAQ),
        faqCtrl.createFAQ
    )
    /** GET /api/faq - list FAQs */
    .get(
        protect,
        faqCtrl.listFAQs
    );

router.route('/:faqId')
    /** PATCH /api/faq/:faqId - update FAQ */
    .patch(
        protect,
        validate(faqParamsValidation.updateFAQ),
        findFAQ,
        faqCtrl.updateFAQ
    )
    /** DELETE /api/faq/:faqId - delete FAQ */
    .delete(
        protect,
        findFAQ,
        faqCtrl.deleteFAQ
    );

/** GET /api/faq/search - search FAQ */
router.get('/search',
    validate(faqParamsValidation.searchFAQ),
    faqCtrl.searchFAQ
);

module.exports = router;
