const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const MongoClient = require('mongodb').MongoClient;

import ProductStatus from './constants.js'

const baseUrl = 'http://teamsesh.bigcartel.com'
const productUrl = baseUrl + '/products'
const dbUrl = 'mongodb://localhost:27017/SeshMobileDatabase'
const dbCollection = 'products'


MongoClient.connect(dbUrl, function(err, db) {
    if (err) throw err;    
    
    const scrapeSuccessCallback = (scrapedProducts) => {
        
        const previousProducts = getSavedProductList()
        
        if (compareProducts(previousProducts, scrapedProducts)) {

        } 


        // db.collection(dbCollection).insertMany(scrapedProducts, function(err, res) {
        //     if (err) throw err;
    
        //     console.log('inserted ' + scrapedProducts.length + ' products');
        //     db.close();
        // });
    }
    const scrapedProducts = scrapeProducts(scrapeSuccessCallback);   
});

function scrapeProducts(scrapeSuccessCallback) {
    request(productUrl, function (error, response, html) {
        if (!error) {
            const $ = cheerio.load(html)
            
            $('.products_list').filter(function () {
                const data = $(this)
    
                const parsedProducts = []
    
                const products = data.children()
                for (let index = 0; index < products.length; ++index) {
                    const product = products[index]
                    
                    if (product.attribs && product.attribs.class ) {
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
                console.log(parsedProducts)
                scrapeSuccessCallback(parsedProducts)
            })
            
        }
    })        
}

function parseProducts(product, soldOut) {
    for (const element of product.children) {
        if (element.type && element.type === 'tag') {
            if (element.name && element.name === 'a') {
                if (element.attribs && element.attribs.href) {
                    const newProduct = {}
                    newProduct['productUrl'] = baseUrl + element.attribs.href                
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
    let comparisonMap = {}
    
}

function isNewProduct(previousProducts, productToCheck) {
    for (const product in previousProducts) {
        if (product.productName && productToCheck.productName && product.productName === productToCheck.productName) {
            if (product.price && productToCheck.price && product.price === productToCheck.price) {
                return false;
            }
        }
    }
    return true;
}

function getSavedProductList() {
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) throw err;
        db.collection('products').find({}).toArray(function (err, result) {
            if (err) throw err;            
            db.close();
            return result;
        });
    });
}

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;