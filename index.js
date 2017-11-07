'use strict'

const express = require('express')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const config = require('./config')

const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(config.db.uri, (err, database) => {
    if (err) {
        console.log('An error occurred while attempting to connect to MongoDB', err)
        process.exit(1)
    }

    require('./routes/product')(app, database);

    app.listen(port, () => {
        console.log('We are live on ' + port);
    });
})
