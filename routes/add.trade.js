const errorJson = require('../config/error.json')
const trade = require('../handlers/trade.handler.js')

const opts = {
    schema: {
        body: {
            type: 'object',
            properties: {
                tickerSymbol: {
                    type: "string"
                },
                quantity: {
                    type: "number"
                },
                toBuy: {
                    type: "boolean"
                },
                sellPrice: {
                    type: "number"
                },
                buyPrice: {
                    type: "number"
                }
            },
            required: ["tickerSymbol", "quantity", "toBuy"]
        }
    }
}

async function routes(fastify, options) {
    var route = '/api/trade'
    fastify.post(route, opts, function(req, res) {
        trade.register(req.body)
            .then(function(resp) {
                res.code(200).send(resp)
                    // res.send("ok")
            })
            .catch(function(err) {
                res.code(err.statusCode).send(err)
            })
    })
}

module.exports = routes
