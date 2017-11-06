const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/SeshMobileDatabase';

MongoClient.connect(url, function (err, db) {
    if (err) {
        throw err;
    }
    db.createCollection('products', function (err, res) {
        if (err) throw err;
        console.log('Collection created!');
        db.close();
    });
});