const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const db = require('../server');
const Faq = db.collection('faqs');
const query = require('../query/query');

// search FAQ by question
const searchFAQ = async (req, res, next) => {
    try {
        const pattern = req.query.question;
        // search question
        const questions = await query.find(Faq, {
            question: {
                $regex: `${pattern}`, $options: '$i'
            },
            isActive: true
        });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, questions, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// delete FAQ
const deleteFAQ = async (req, res, next) => {
    try {
        // find FAQs
        const faqId = req.params.faqId;
        let message;
        // delete and verify
        const faq = await query.deleteOne(Faq, { _id: ObjectId(faqId) });
        if (faq['deletedCount'] === 0) {
            message = 'Somthing went wrong while deleting faq. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        message = 'FAQ deleted successfully.';
        let obj = resPattern.successPattern(httpStatus.OK, { message }, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// update FAQ
const updateFAQ = async (req, res, next) => {
    try {
        const faqId = req.params.faqId;
        const { question, answer, isActive } = req.body;
        // update data and verify
        const faq = await query.findOneAndUpdate(Faq, { _id: ObjectId(faqId) },
            {
                $set: {
                    question,
                    answer,
                    isActive,
                    updatedAt: new Date()
                }
            },
            {
                returnOriginal: false
            }
        );
        if (faq['ok'] === 0) {
            let message = 'Something went wrong while update FAQ. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, faq.value, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// list FAQs
const listFAQs = async (req, res, next) => {
    try {
        // find FAQs
        const faqs = await query.find(Faq, { isActive: true });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, faqs, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// create FAQ
const createFAQ = async (req, res, next) => {
    try {
        const { question, answer } = req.body;
        let faq;
        let message;
        // find FAQ and verify
        faq = await query.findOne(Faq, { question });
        if (faq) {
            message = 'FAQ already created.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // save faq data and verify
        faq = await query.insert(Faq, {
            question,
            answer,
            isActive: true
        });
        if (faq.insertedCount === 0) {
            message = 'Somthing went wrong while creating FAQ. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, faq.ops[0], 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

module.exports = {
    createFAQ,
    listFAQs,
    updateFAQ,
    deleteFAQ,
    searchFAQ
}
