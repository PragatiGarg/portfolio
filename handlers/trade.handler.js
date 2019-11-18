const mongojs = require('mongojs')
const db = mongojs('tracker')
const errorJson = require('../config/error.json')
const portfolio = require('./portfolio.handler.js')


var registerTrade = function(input) {
    return new Promise(function(resolve, reject) {
        // Required Inputs: tickerSymbol, quantity, buy or sell, buyPrice or sellPrice
        var tickerSymbol = input && input.tickerSymbol && typeof input.tickerSymbol == "string" ? input.tickerSymbol.toUpperCase() : false
        var quantity = input && input.quantity && typeof input.quantity == "number" ? input.quantity : false
        var buyPrice = input && input.buyPrice && typeof input.buyPrice == "number" ? input.buyPrice.toFixed(2) : false
        var sellPrice = input && input.sellPrice && typeof input.sellPrice == "number" ? input.sellPrice.toFixed(2) : false
        var toBuy = input && input.toBuy && typeof input.toBuy == "boolean" ? input.toBuy : false // toBuy = true is buying and toBuy = false is selling
        if (tickerSymbol && quantity && ((toBuy && buyPrice) || (!toBuy && sellPrice))) {
            // valid inputs
            var toCall = toBuy ? "add" : "sub"
            portfolio[toCall](input)
                .then(function(resp) {
                    db.trade.save(input, function(err, dbResp) {
                        console.log("err, resp from saving trade to db: ", err, resp);
                        if (!err && dbResp) {
                            resolve(dbResp)
                        } else {
                            reject(errorJson["INTERNAL_SERVER_ERROR"])
                        }
                    })
                })
                .catch(function(err) {
                    reject(err)
                })
        } else {
            reject(errorJson["INVALID_INPUT"])
        }
    })
}

var revertTrade = function(input) {
    return new Promise(function(resolve, reject) {
        var tradeId = input && input.tradeId && mongojs.ObjectId.isValid(input.tradeId) ? input.tradeId : false
        console.log("tradeId,input.tradeId: ", tradeId, input.tradeId);
        if (tradeId) {
            db.trade.findOne({
                _id: mongojs.ObjectId(tradeId)
            }, function(err, doc) {
                if (!err && doc) {
                    var toBuy = !doc.toBuy
                    var toCall = toBuy ? "add" : "sub"
                    var price = toBuy ? doc.sellPrice : doc.buyPrice
                    var toSend = {
                        tickerSymbol: doc.tickerSymbol,
                        quantity: doc.quantity,
                        buyPrice: price
                    }
                    console.log("toSend: ", toSend);
                    portfolio[toCall](toSend)
                        .then(function(resp) {
                            db.trade.remove({
                                _id: mongojs.ObjectId(tradeId)
                            }, function(err, dbResp) {
                                console.log("err, resp from removing trade to db: ", err, resp);
                                if (!err && dbResp) {
                                    resolve(dbResp)
                                } else {
                                    reject(errorJson["INTERNAL_SERVER_ERROR"])
                                }
                            })
                        })
                        .catch(function(err) {
                            reject(err)
                        })
                } else {
                    reject(errorJson["INVALID_TRANSACTION"])
                }
            })
        } else {
            reject(errorJson["INVALID_INPUT"])
        }
    })
}


var updateTrade = function(input) {
    return new Promise(function(resolve, reject) {
        revertTrade(input)
            .then(function(resp) {
                return registerTrade(input)
            })
            .then(function(respRegister) {
                resolve(respRegister)
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

var fetchAllTrade = function() {
    return new Promise(function(resolve, reject) {
        db.trade.find({}, function(err, docs) {
            console.log("Err and docs from fetch trades: ", err, docs);
            if (!err) {
                resolve(docs)
            } else {
                reject(errorJson["INTERNAL_SERVER_ERROR"])
            }
        })
    })
}


module.exports = {
    register: registerTrade,
    revert: revertTrade,
    update: updateTrade,
    fetchAll: fetchAllTrade
}
