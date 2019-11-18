const fastify = require('fastify')({
    logger: true
})
const packageJSON = require('./package.json');
const port = 8888


fastify.register(require('./routes/add.trade'))
fastify.register(require('./routes/update.trade'))
fastify.register(require('./routes/remove.trade'))
fastify.register(require('./routes/fetch.portfolio'))
fastify.register(require('./routes/fetch.holding'))
fastify.register(require('./routes/fetch.return'))

fastify.listen(port, "127.0.0.1", function(err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
})
