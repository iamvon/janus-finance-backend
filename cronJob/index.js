const Promise = require('bluebird')

module.exports = async () => {
    await Promise.delay(5000) // Delay before start
    console.log('Jobs started')

    require('./getAldrinPool')
    require('./getOrcaPool')
    require('./getRaydiumPool')
    require('./getSolanaMeta')
    require('./getSolanaToken')
    require('./getWormholeToken')
    require('./updatePriceChangePercent')
    require('./updateTopTrending')
    require('./updateTopTransaction')
    require('./updateJupiterSupportToken')
}
