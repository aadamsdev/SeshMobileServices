const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/SeshMobileDatabase';

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    db.collection('products').find({ soldOut: false }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
});