require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

exports.connection = () => {
    return new Promise(async (resolve, reject) => {
        await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
            if (err) console.log("error", err);

            console.log("Database connected...");
            let db = client.db('vreality');
            resolve(db);
        });
    });
}
