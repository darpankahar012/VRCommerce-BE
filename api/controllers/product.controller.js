const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const APIError = require('../helpers/APIError.helper');
const resPattern = require('../helpers/resPattern.helper');
const db = require('../server');
const Product = db.collection('products');
const query = require('../query/query');

// update product details
const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const { price, quantity, category, sourceImage, imageUrl, description, options, isActive } = req.body;
        // update and verify
        const product = await query.findOneAndUpdate(Product, { _id: ObjectId(productId) },
            {
                $set: {
                    price,
                    quantity,
                    category: ObjectId(category),
                    sourceImage: ObjectId(sourceImage),
                    imageUrl,
                    description,
                    options,
                    isActive,
                    updatedAt: new Date()
                }
            },
            {
                returnOriginal: false
            }
        );
        if (product['ok'] === 0) {
            let message = 'Something went wrong while updating product. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, product.value, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// delete product
const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        let message;
        // delete and verify
        const product = await query.deleteOne(Product, { _id: ObjectId(productId) });
        if (product['deletedCount'] === 0) {
            message = 'Something went wrong while deleting product. Please try again.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        message = 'Product deleted successfully.'
        let obj = resPattern.successPattern(httpStatus.OK, { message }, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// list products by category
const productByCategory = async (req, res, next) => {
    try {
        const categoryId = req.query.category;
        // find products
        const products = await query.find(Product, {
            category: ObjectId(categoryId),
            isActive: true
        });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, products, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// list all products
const listProducts = async (req, res, next) => {
    try {
        // find products
        const products = await query.find(Product, { isActive: true });

        // send response
        let obj = resPattern.successPattern(httpStatus.OK, products, 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

// create new product
const createProduct = async (req, res, next) => {
    try {
        let message;
        let product;
        const { name, price, quantity, category, sourceImage, imageUrl, description, options } = req.body;

        // find product by name and verify
        product = await query.findOne(Product,
            {
                name: { '$regex': name, '$options': 'i' },
                isActive: true
            }
        );
        if (product) {
            message = 'Product is already created.';
            return next(new APIError(message, httpStatus.BAD_REQUEST, true));
        }

        // save product details and verify
        product = await query.insert(Product, {
            name,
            price,
            quantity,
            category: ObjectId(category),
            sourceImage: ObjectId(sourceImage),
            imageUrl,
            description,
            options,
            isActive: true
        });
        if (product['insertedCount'] === 0) {
            message = 'Something went wrong while creating new product. Please try again.';
            return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
        }

        // send response
        let obj = resPattern.successPattern(httpStatus.CREATED, product.ops[0], 'success');
        return res.status(obj.code).json(obj);
    } catch (e) {
        return next(new APIError(e.message, httpStatus.BAD_REQUEST, true));
    }
}

module.exports = {
    createProduct,
    listProducts,
    deleteProduct,
    updateProduct,
    productByCategory
}
