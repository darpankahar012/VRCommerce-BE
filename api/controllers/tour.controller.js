const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const db = require('../server');
const Tour = db.collection('tours');
const query = require('../query/query');

// delete tour
const deleteTour = async (req, res, next) => {
    try {
        const tourId = req.params.tourId;
        let message;
        // delete tour and verify
        const tour = await query.deleteOne(Tour, { _id: ObjectId(tourId) });
        if (tour['deletedCount'] === 0) {
            message = 'Somthing went wrong while deleting tour. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        message = 'Tour deleted successfully.';
        let obj = resPattern.successPattern(httpStatus.OK, { message }, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// list all tours
const listTours = async (req, res, next) => {
    try {
        // find tours
        const tours = await query.find(Tour, { isActive: true });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, tours, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// create new tour
const createTour = async (req, res, next) => {
    try {
        const user = req.user;
        const tourData = req.body;
        let message;
        // find tour and verify
        let tour = await query.findOne(Tour, { name: tourData.name, isActive: true });
        if (tour) {
            message = 'Tour already created.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // save tour data and verify
        tourData.user = user._id;
        tourData.category = ObjectId(tourData.category);
        tour = await query.insert(Tour, tourData);
        if (tour.insertedCount === 0) {
            message = 'Somtheing went wrong while create tour. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, tour.ops[0], 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

module.exports = {
    createTour,
    listTours,
    deleteTour
}
