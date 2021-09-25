const path = require('path');
const multer = require('multer');
const httpStatus = require('http-status');
const APIError = require('./APIError.helper');

// image storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb, next) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    // image type
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new APIError('Only images are allowed', httpStatus.BAD_REQUEST, true));
        }
        callback(null, true);
    },
});

module.exports = upload;
