module.exports = function (app, db) {
    const collection = db.collection('products')

    app.get('/product/all', (req, res) => {
        collection.find({}).toArray()
        .then(products => res.status(200).send(products))
        .catch(err => res.status(500).send(err))
    });

    app.get('/product', (req, res) => {
        if (req.query.soldOut && typeof(req.query.soldOut) === 'string' && (req.query.soldOut === 'false' || req.query.soldOut === 'true')) {
            const isSoldOut = req.query.soldOut === 'true'

            collection.find({soldOut: isSoldOut}).toArray()
            .then(products => res.status(200).send(products))
            .catch(err => res.status(500).send(err))
        } else {
            res.send(404, null)
        }
    });
};