'use strict'

module.exports = function (ctx) {

    // extract context from passed in object
    const db = ctx.db,
        server = ctx.server

    // assign collection to variable for further use
    const collection = db.collection('products')

    /**
     * Read
     */
    server.get('/all-products', (req, res, next) => {
        collection.find({}).toArray()
            .then(products => res.send(200, products))
            .catch(err => res.send(500, err))

        next()
    })

    server.get('/products', (req, res, next) => {
        console.log(req.query)
        if (req.query.soldOut && typeof(req.query.soldOut) === 'string' && (req.query.soldOut === 'false' || req.query.soldOut === 'true')) {
            const isSoldOut = req.query.soldOut === 'true'

            collection.find({soldOut: isSoldOut}).toArray()
            .then(products => res.send(200, products))
            .catch(err => res.send(500, err))
        } else {
            res.send(404, null)
        }
        
        next()
    })
}