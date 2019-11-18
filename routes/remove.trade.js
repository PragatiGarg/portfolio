const errorJson = require('../config/error.json')
const trade = require('../handlers/trade.handler.js')

const opts = {
    schema: {
        body: {
            type: 'object',
            properties: {
                tradeId: {
                    type: "string"
                }
            },
            required: ["tradeId"]
        }
    }
}

async function routes(fastify, options) {
    var route = '/api/trade'
    fastify.delete(route, opts, function(req, res) {
        trade.revert(req.body)
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
