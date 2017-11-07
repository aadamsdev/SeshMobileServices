'use strict'

module.exports = {
    name: 'sesh-mobile-services',
    version: '0.0.1',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    db: {
        uri: 'mongodb://localhost:27017/SeshMobileDatabase',
        productCollection: 'products'
    },
    scraperBaseUrl: 'http://teamsesh.bigcartel.com',
    scraperProductUrl: 'http://teamsesh.bigcartel.com/products' 
}