const httpStatus = require('http-status');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const url = 'http://vrealityapi.ipangram.com';
const db = require('../server');
const Tour = db.collection('tours');
const Category = db.collection('categories');
const Faq = db.collection('faqs');
const Product = db.collection('products');
const query = require('../query/query');
const { ObjectId } = require('mongodb');

// find product
const findProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        // find and verify
        const product = await query.findOne(Product, { _id: ObjectId(productId) });
        if (!product) {
            let message = `Product not found with productId: ${productId}.`;
            return next(new APIError(message, httpStatus.NOT_FOUND, true));
        }
        next();
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// find FAQ
const findFAQ = async (req, res, next) => {
    try {
        const faqId = req.params.faqId;
        // find tour and verify
        const faq = await query.findOne(Faq, { _id: ObjectId(faqId) });
        if (!faq) {
            let message = `FAQ not found with faqId: ${faqId}.`;
            return next(new APIError(message, httpStatus.NOT_FOUND, true));
        }
        next();
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// find category
const findCategory = async (req, res, next) => {
    try {
        const requestId = req.params.categoryId;
        const categoryId = (typeof requestId === 'undefined') ? req.body.category : requestId;
        console.log(categoryId);
        // find tour and verify
        const category = await query.findOne(Category, { _id: ObjectId(categoryId) });
        if (!category) {
            let message = `Category not found with categoryId: ${categoryId}.`;
            return next(new APIError(message, httpStatus.NOT_FOUND, true));
        }
        next();
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// find tour
const findTour = async (req, res, next) => {
    try {
        const tourId = req.params.tourId;
        // find tour and verify
        const tour = await query.findOne(Tour, { _id: ObjectId(tourId) });
        if (!tour) {
            let message = `Tour not found with tourId: ${tourId}.`;
            return next(new APIError(message, httpStatus.NOT_FOUND, true));
        }
        next();
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// upload single file
const singleUpload = (req, res, next) => {
    try {
        const file = req.file;
        // check uploaded file
        if (!file) {
            return next(new APIError('No file uploaded.', httpStatus.NOT_FOUND, true));
        }

        // send response
        let response = {
            file: `${url}/images/${file.filename}`
        }
        let obj = resPattern.successPattern(httpStatus.OK, response, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// upload multiple files
const multipleUpload = (req, res, next) => {
    try {
        const files = req.files;
        // check uploaded files
        if (!files) {
            return next(new APIError('No files uploaded.', httpStatus.NOT_FOUND, true));
        }

        // filter files
        let filesList = [];
        files.map(file => {
            filesList.push({
                file: `${url}/images/${file.filename}`
            });
        });

        // response
        let obj = resPattern.successPattern(httpStatus.OK, { filesList }, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

module.exports = {
    findCategory,
    findTour,
    findFAQ,
    findProduct,
    singleUpload,
    multipleUpload
}
