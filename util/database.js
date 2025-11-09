const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(`mongodb+srv://marynaUser:${process.env.MONGO_DB_USER_KEY}@cluster0.ddbf7zc.mongodb.net/?appName=Cluster0`)
    .then(
        client => {
            console.log('Connected'); 
            _db = client.db();
            callback();
        }
    ).catch(error => {
        console.log(error);
        throw error;
    });
};

const getDb = () => {
    if (_db) {
        return _db;
    } else {
        throw 'No database found';
    }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
