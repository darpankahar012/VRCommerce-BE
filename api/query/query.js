const moment = require('moment');

exports.findOne = (collection, query) => {
    return new Promise((resolve, reject) => {
        collection.findOne(query, (err, result) => {
            if (err) {
                return reject({ message: "DB query Failed", error: err });
            } else {
                resolve(result);
            }
        });
    });
}

exports.find = (collection, query) => {
    return new Promise((resolve, reject) => {
        collection.find(query).toArray((err, result) => {
            if (err) {
                return reject({ message: "DB query Failed", error: err });
            } else {
                resolve(result);
            }
        });
    });
}

exports.findOneAndUpdate = (collection, query, setParameters, getResponse) => {
    return new Promise((resolve, reject) => {
        collection.findOneAndUpdate(query, setParameters, getResponse, (err, result) => {
            if (err) {
                return reject({ message: "DB query Failed", error: err });
            } else {
                resolve(result);
            }
        });
    });
}

exports.updateMany = (collection, query, setParameters, getResponse) => {
    return new Promise((resolve, reject) => {
        collection.findOneAndUpdate(query, setParameters, getResponse, (err, result) => {
            if (err) {
                return reject({ message: "DB query Failed", error: err });
            } else {
                resolve(result);
            }
        });
    });
}

exports.insert = (collection, query) => {
    query.createdAt = new Date(moment().utc().format());
    query.updatedAt = null;
    return new Promise((resolve, reject) => {
        collection.insertOne(query, (err, result) => {
            if (err) {
                return reject({ message: "DB query Failed", error: err });
            } else {
                resolve(result);
            }
        });
    });
}

exports.deleteOne = (collection, query) => {
    return new Promise((resolve, reject) => {
        collection.deleteOne(query, (err, result) => {
            if (err) {
                return reject({ message: "DB query Failed", error: err });
            } else {
                resolve(result);
            }
        });
    });
}
