const mongojs = require('mongojs')
const db = mongojs('tracker')
const errorJson = require('../config/error.json')
const security = require('./security.handler.js')
const async = require('async');
const nse = require('./nse.js')

var subTrade = function(input) {
    return new Promise(function(resolve, reject) {
        console.log("input: ", input);
        var tickerSymbol = input.tickerSymbol && typeof input.tickerSymbol == "string" ? input.tickerSymbol.toUpperCase() : false
        var quantity = input.quantity && typeof input.quantity == "number" && input.quantity > 0 ? input.quantity : false
        console.log("tickerSymbol,quantity, input.tickerSymbol,input.quantity: ", tickerSymbol, quantity, input.tickerSymbol, input.quantity);
        if (tickerSymbol && quantity) {
            security.check({
                    tickerSymbol: tickerSymbol
                })
                .then(function(resp) {
                    // Update query because we need to check that the quantity will not turn negative
                    db.portfolio.findOne({
                        tickerSymbol: tickerSymbol
                    }, function(err, doc) {
                        console.log("err and doc from finding symbol in portfolio db: ", err, doc);
                        if (!err) {
                            doc = doc ? doc : {}
                            doc.quantity = doc && doc.quantity ? doc.quantity : 0
                            newQuantity = (doc.quantity - quantity)
                            console.log("newQuantity: ", newQuantity);
                            if (newQuantity >= 0) {
                                db.portfolio.update({
                                    tickerSymbol: tickerSymbol
                                }, {
                                    $set: {
                                        quantity: newQuantity
                                    }
                                }, function(err, doc) {
                                    console.log("err and doc from updating symbol in portfolio db: ", err, doc);
                                    if (!err) {
                                        resolve(true)
                                    } else {
                                        reject(errorJson["INTERNAL_SERVER_ERROR"])
                                    }
                                })
                            } else {
                                reject(errorJson["INVALID_TRANSACTION"])
                            }
                        } else {
                            reject(errorJson["INTERNAL_SERVER_ERROR"])
                        }
                    })
                })
                .catch(function(err) {
                    console.log("Error from Security Check: ", err);
                    reject(err)
                })
        } else {
            reject(errorJson["INVALID_INPUT"])
        }
    })
}


var addTrade = function(input) {
    return new Promise(function(resolve, reject) {
        var tickerSymbol = input.tickerSymbol && typeof input.tickerSymbol == "string" ? input.tickerSymbol.toUpperCase() : false
        var buyPrice = input.buyPrice && typeof input.buyPrice == "number" ? input.buyPrice.toFixed(2) : false
        var quantity = input.quantity && typeof input.quantity == "number" ? input.quantity : false
        if (tickerSymbol && buyPrice && quantity) {
            security.check({
                    tickerSymbol: tickerSymbol
                })
                .then(function(resp) {
                    // Update query with upsert true is not used because the averageBuyPrice needs to be calculated with the existing value
                    db.portfolio.findOne({
                        tickerSymbol: tickerSymbol
                    }, function(err, doc) {
                        console.log("err and doc from finding symbol in portfolio db: ", err, doc);
                        if (!err) {
                            doc = doc ? doc : {}
                            doc.averageBuyPrice = doc && doc.averageBuyPrice ? doc.averageBuyPrice : 0.0
                            doc.quantity = doc && doc.quantity ? doc.quantity : 0
                            newQuantity = (quantity + doc.quantity)
                            averageBuyPrice = ((buyPrice * quantity + doc.averageBuyPrice * doc.quantity) / newQuantity).toFixed(2)
                            console.log("newQuantity, averageBuyPrice: ", newQuantity, averageBuyPrice);
                            db.portfolio.update({
                                tickerSymbol: tickerSymbol
                            }, {
                                $set: {
                                    quantity: newQuantity,
                                    averageBuyPrice: averageBuyPrice
                                }
                            }, {
                                upsert: true
                            }, function(err, doc) {
                                console.log("err and doc from updating symbol in portfolio db: ", err, doc);
                                if (!err) {
                                    resolve(true)
                                } else {
                                    reject(errorJson["INTERNAL_SERVER_ERROR"])
                                }
                            })
                        } else {
                            reject(errorJson["INTERNAL_SERVER_ERROR"])
                        }
                    })
                })
                .catch(function(err) {
                    console.log("Error from Security Check: ", err);
                    reject(err)
                })
        } else {
            reject(errorJson["INVALID_INPUT"])
        }
    })
}

var getPortfolio = function() {
    return new Promise(function(resolve, reject) {
        db.portfolio.find({}, function(err, docs) {
            console.log("Err and docs from fetch portfolio: ", err, docs);
            if (!err) {
                resolve(docs)
            } else {
                reject(errorJson["INTERNAL_SERVER_ERROR"])
            }
        })
    })
}

var getReturns = function() {
    return new Promise(function(resolve, reject) {
        var output = {
            totalReturns: 0.00
        };
        getPortfolio()
            .then(function(resp) {
                if (resp && Array.isArray(resp) && resp.length > 0) {
                    async.map(resp, function(element, cb) {
                        console.log("element: ", element);
                        nse.getLastPrice(element.tickerSymbol)
                            .then(function(respNse) {
                                if (respNse && respNse.lastPrice) {
                                    var ret = (respNse.lastPrice - element.averageBuyPrice) * element.quantity
                                    cb(null, ret)
                                } else {
                                    cb(errorJson["INTERNAL_SERVER_ERROR"])
                                }
                            })
                    }, function(err, resp) {
                        if (!err && resp) {
                            output.totalReturns = (resp.reduce((a, b) => a + b, 0)).toFixed(2)
                            resolve(output)
                        } else {
                            console.log("Error while async mapping: ", err);
                        }
                    })
                } else {
                    resolve(output)
                }
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

module.exports = {
    add: addTrade,
    sub: subTrade,
    get: getPortfolio,
    getReturns: getReturns
}

// addTrade({
//     tickerSymbol: "WIPRO",
//     buyPrice: 400,
//     quantity: 5
// })
// .then(function(resp) {
//     console.log("Resp from adding trade: ", resp);
// })
// .catch(function(err) {
//     console.log("Err from adding trade: ", err);
// })
