const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const db = require('../server');
const Category = db.collection('categories');
const query = require('../query/query');

// delete category
const deleteCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        let message;
        // delete and verify
        const category = await query.deleteOne(Category, { _id: ObjectId(categoryId) });
        if (category['deletedCount'] === 0) {
            message = 'Somthing went wrong while deleting category. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        message = 'Category deleted successfully.';
        let obj = resPattern.successPattern(httpStatus.OK, { message }, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// update category
const updateCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        // update category data and verify
        const category = await query.findOneAndUpdate(Category, { _id: ObjectId(categoryId) },
            {
                $set: {
                    isActive: req.body.isActive,
                    updatedAt: new Date()
                }
            },
            {
                returnOriginal: false
            }
        );
        if (category['ok'] === 0) {
            let message = 'Something went wrong while update category. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, category.value, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// list categories
const listCategories = async (req, res, next) => {
    try {
        // find categories
        const categories = await query.find(Category, { isActive: true });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, categories, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// add new category
const createcategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        let message;
        // find category and verify
        let category = await query.findOne(Category, { name });
        if (category) {
            message = 'Category already created.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // save category data and verify
        category = await query.insert(Category, {
            name,
            isActive: true
        });
        if (category.insertedCount === 0) {
            message = 'Somthing went wrong while creating category. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, category.ops[0], 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

module.exports = {
    createcategory,
    listCategories,
    updateCategory,
    deleteCategory
}
