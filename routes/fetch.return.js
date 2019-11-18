const errorJson = require('../config/error.json')
const portfolio = require('../handlers/portfolio.handler.js')

async function routes(fastify, options) {
    var route = '/api/returns'
    fastify.get(route, function(req, res) {
        portfolio.getReturns()
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
