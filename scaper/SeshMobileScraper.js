const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const gcm = require('node-gcm');

const config = require('../config')

MongoClient.connect(config.db.uri, function (err, db) {
    if (err) throw err;

    const scrapeSuccessCallback = (scrapedProducts) => {
        const savedProductsCallback = (previousProducts) => {
            const comparisonMap = compareProducts(previousProducts, scrapedProducts)
            let updateCollection = false
            console.log('map', comparisonMap)
            for (const key of Array.from(comparisonMap.keys())) {
                if (comparisonMap.get(key)) {
                    updateCollection = true
                    break;
                }
            }

            if (updateCollection) {
                const wipeTableCallback = () => {
                    const newProducts = Array.from(comparisonMap.keys())
                    // for (const key of Array.from(comparisonMap.keys())) {
                    //     if (comparisonMap.get(key)) {
                    //         newProducts.push(key)
                    //     }
                    // }
                    insertProducts(db, newProducts)
                }
                wipeTable(db, wipeTableCallback)
            } else {
                console.log('No product updates found')
            }
            
        }

        getSavedProductList(db, savedProductsCallback)
        return 
    }
    const scrapedProducts = scrapeProducts(scrapeSuccessCallback);
});

function scrapeProducts(scrapeSuccessCallback) {
    request(config.scraperProductUrl, function (error, response, html) {
        if (error) throw error

        const $ = cheerio.load(html)
        $('.products_list').filter(function () {
            const data = $(this)

            const parsedProducts = []

            const products = data.children()
            for (let index = 0; index < products.length; ++index) {
                const product = products[index]

                if (product.attribs && product.attribs.class) {
                    if (product.attribs.class === 'product sold') {
                        const parsedProduct = parseProducts(product, true);
                        if (parsedProduct) {
                            parsedProducts.push(parsedProduct)
                        }
                    } else if (product.attribs.class === 'product') {
                        const parsedProduct = parseProducts(product, false)
                        if (parsedProduct) {
                            parsedProducts.push(parsedProduct)
                        }
                    }
                }
            }
            // console.log(parsedProducts)
            scrapeSuccessCallback(parsedProducts)
        })
    })
}

function parseProducts(product, soldOut) {
    for (const element of product.children) {
        if (element.type && element.type === 'tag') {
            if (element.name && element.name === 'a') {
                if (element.attribs && element.attribs.href) {
                    const newProduct = {}
                    newProduct['productUrl'] = config.scraperBaseUrl + element.attribs.href
                    newProduct['soldOut'] = soldOut
                    for (data of element.children) {
                        if (data.type && data.type === 'tag') {
                            if (data.name) {
                                if (data.name === 'img') {
                                    if (data.attribs && data.attribs.src) {
                                        newProduct['imageUrl'] = data.attribs.src
                                    }
                                } else if (data.name === 'b') {
                                    if (data.children && data.children.length >= 1 && data.children[0].data) {
                                        newProduct['productName'] = data.children[0].data
                                    }
                                } else if (data.name === 'i') {
                                    if (data.children && data.children.length > 1 && data.children[1].data) {
                                        newProduct['price'] = parseFloat(data.children[1].data)
                                    }
                                }
                            }
                        }
                    }
                    return newProduct;
                }
            }
        }
    }
}

function compareProducts(previousProducts, currentProducts) {
    let comparisonMap = new Map()
    for (const currProduct of currentProducts) {
        if (isNewProduct(previousProducts, currProduct)) {
            comparisonMap.set(currProduct, true)
        } else {
            comparisonMap.set(currProduct, false)
        }
    }
    return comparisonMap
}

function isNewProduct(previousProducts, productToCheck) {
    // console.log('Prev', previousProducts)
    for (const product of previousProducts) {
        if (product.productName && productToCheck.productName && product.productName === productToCheck.productName) {
            if (product.price && productToCheck.price && product.price === productToCheck.price) {
                return false;
            }
        }
    }
    return true;
}

function getSavedProductList(db, queryCallback) {
    db.collection('products').find({}).toArray(function (err, result) {
        if (err) throw err;
        queryCallback(result)
    });
}

function insertProducts(db, products) {
    console.log('Products to be inserted', products)
    db.collection(config.db.productCollection).insertMany(products, function (err, res) {
        if (err) throw err;
        console.log('inserted ' + products.length + ' products');
    });
}

function wipeTable(db, wipeTableCallback) {
    db.collection('products').remove({}, function (err, resultObj) {
        if (err) throw err;
        console.log('deleted ' + resultObj.result.n + ' products');
        wipeTableCallback()
    });
}

function sendGCM() {

}

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;