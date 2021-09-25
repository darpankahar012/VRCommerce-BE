const router = require('express').Router();
const tourCtrl = require('../controllers/tour.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('express-validation');
const { tourParamsValidation } = require('../helpers/joi.validation.helper');
const { findTour, findCategory } = require('../controllers/common.controller');

router.route('/')
    /*** POST /api/tour/  - create new tour */
    .post(
        protect,
        validate(tourParamsValidation.createTour),
        findCategory,
        tourCtrl.createTour
    )
    /*** GET /api/tour/  - list all tours */
    .get(
        protect,
        tourCtrl.listTours
    );

// router.param(findTour);
router.route('/:tourId')
    /*** DELETE /api/tour/:tourId  - delete tour */
    .delete(
        protect,
        findTour,
        tourCtrl.deleteTour
    );

module.exports = router;
