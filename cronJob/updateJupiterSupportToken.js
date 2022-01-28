const cron = require('node-cron')
const {getModel} = require("../models")
const Promise = require('bluebird')
const {getJupiterSupportTokens} = require("../library/jup.ag")

const _store = {
    isRunning: false
}

// const BATCH_SIZE = 50
// const TIME_TO_UPDATE = 1000 * 60 *10

// function rateLimitDelay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

const updateJupiterSupportToken = async () => {
    const SolanaToken = getModel("solana.model")
    const tokens = await getJupiterSupportTokens()

    console.log("Tokens", tokens.length)

    if (tokens.length > 0) {
        await SolanaToken.updateMany({isJupiterSupport: true}, {$set: {isJupiterSupport: false}})
    }

    const coinAddresses = tokens.map(token => token.address)
    await SolanaToken.updateMany({
        address: {$in: coinAddresses}
    }, {
        $set: {
            isJupiterSupport: true,
        }
    })
    console.log("Updated Jupiter Support ", tokens.length, "tokens")

    return true
}

// 1 minute
module.exports = cron.schedule("*/5 * * * *", async () => {
    if (_store.isRunning) return true
    _store.isRunning = true

    try {
        console.log('Update Jupiter support tokens at: ' + new Date())
        await updateJupiterSupportToken()
    } catch (error) {
        console.log("ERROR", error)
    }

    _store.isRunning = false
}, {})

