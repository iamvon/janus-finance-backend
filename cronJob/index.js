const Promise = require('bluebird')

module.exports = async () => {
    await Promise.delay(5000) // Delay before start
    console.log('Jobs started')

    require('./updatePriceChangePercent')
    require('./updateTopTrending')
    require('./updateTopTransaction')
}
