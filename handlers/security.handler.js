const mongojs = require('mongojs')
const db = mongojs('tracker')
const nse = require('./nse.js')
const errorJson = require('../config/error.json')

// Create an unique index on tickerSymbol for the security collection
// db.security.createIndex( { "tickerSymbol": 1 }, { unique: true } )


var addSecurity = function(input) {
    return new Promise(function(resolve, reject) {
        // Validating inputs: tickerSymbol & current price
        var tickerSymbol = input && typeof input == "object" && input.tickerSymbol && typeof input.tickerSymbol == "string" ? input.tickerSymbol.toUpperCase() : false
        console.log("tickerSymbol: ", tickerSymbol);
        if (tickerSymbol) {
            nse.getLastPrice(tickerSymbol)
                .then(function(resp) {
                    if (resp && resp.lastPrice) {
                        db.security.insert({
                            tickerSymbol: tickerSymbol,
                            currentPrice: resp.lastPrice
                        }, function(err, result) {
                            console.log("Error from db: ", err);
                            console.log("Result from db: ", result);
                            if (!err && result) {
                                resolve(result)
                            } else {
                                if (err.code == 11000) {
                                    reject(errorJson["DUPLICATE_ENTRY"])
                                } else {
                                    reject(errorJson["INTERNAL_SERVER_ERROR"])
                                }
                            }
                        })
                    } else {
                        reject(errorJson["INVALID_INPUT"])
                    }
                })
                .catch(function(err) {
                    console.log("Error from NSE API Call: ", err);
                    reject(errorJson["INTERNAL_SERVER_ERROR"])
                })
        } else {
            reject(errorJson["INVALID_INPUT"])
        }

    })
}

var checkSecurity = function(input) {
    return new Promise(function(resolve, reject) {
        var tickerSymbol = input && typeof input == "object" && input.tickerSymbol && typeof input.tickerSymbol == "string" ? input.tickerSymbol.toUpperCase() : false
        if (tickerSymbol) {
            db.security.findOne({
                tickerSymbol: tickerSymbol
            }, function(err, resp) {
                console.log("Error and resp from db: ", err, resp);
                if (!err && resp) {
                    resolve(resp)
                } else if (!err) {
                    console.log("Trying to add Security: ", input);
                    addSecurity(input)
                        .then(function(addresp) {
                            resolve(addresp)
                        })
                        .catch(function(err) {
                            console.log("Error from db: ", err);
                            reject(errorJson["NOT_FOUND"])
                        })
                } else {
                    reject(errorJson["INTERNAL_SERVER_ERROR"])
                }
            })
        } else {
            reject(errorJson["INVALID_INPUT"])
        }
    })
}

module.exports = {
    add: addSecurity,
    check: checkSecurity
}

// addSecurity({
//         tickerSymbol: "GODREJIND"
//     })
//     .then(function(resp) {
//         console.log("resp: ", resp);
//     })
//     .catch(function(err) {
//         console.log("err: ", err);
//     })
