const events = require('events').EventEmitter
const eventEmitter = new events.EventEmitter()
// const logger = console

module.exports = Object.freeze({
    registerListener: function() {
        // Add Error listener
        eventEmitter.on('error', (err) => {
            // logger.error('Enexpected error on emitter', err)
        })
        return eventEmitter
    },
    removeAllListener: function() {
        // Remove the emitter listener should force the exception
        eventEmitter.removeAllListeners('error')
    }
})