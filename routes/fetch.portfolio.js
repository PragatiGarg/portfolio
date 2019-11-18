const errorJson = require('../config/error.json')
const trade = require('../handlers/trade.handler.js')

async function routes(fastify, options) {
    var route = '/api/trade'
    fastify.get(route, function(req, res) {
        trade.fetchAll()
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
