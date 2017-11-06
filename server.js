var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

const baseUrl = 'http://teamsesh.bigcartel.com';
const productUrl = baseUrl + '/products';



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


request(productUrl, function (error, response, html) {
    if (!error) {
        var $ = cheerio.load(html)
        
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
                // console.log(products[index])
            }

            console.log(parsedProducts)
        })

    }
})


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;