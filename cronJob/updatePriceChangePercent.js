const cron = require('node-cron')
const {getModel} = require("../models")
const {getCoinGeckoChange} = require("../library/getCoinChangePercent")
const Promise = require('bluebird')

const _store = {
    isRunning: false
}

// const BATCH_SIZE = 50
// const TIME_TO_UPDATE = 1000 * 60 *10

function rateLimitDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const updatePriceChangePercent = async () => {
    const SolanaToken = getModel("solana.model")
    const query = {
        "extensions.coingeckoId": {$exists: true},
        // $or: [
        //     {lastChangePercentUpdated: {$exists: false}},
        //     {lastChangePercentUpdated: {$lte: new Date(Date.now() - TIME_TO_UPDATE)}}
        // ]
    }
    const items = await SolanaToken
        .find(query)
        .sort({lastChangePercentUpdated: 1})
        // .limit(BATCH_SIZE)
        .lean()

    if (!items.length) return true

    console.log("Items", items.length)

    await Promise.map(items, async (item) => {
        try {
            const changePercents = {
                t24h: await getCoinGeckoChange(item.extensions.coingeckoId, 1),
                t7d: await getCoinGeckoChange(item.extensions.coingeckoId, 7),
                t1m: await getCoinGeckoChange(item.extensions.coingeckoId, 30),
            }
            await SolanaToken.updateOne({_id: item._id}, {
                $set: {
                    lastChangePercentUpdated: new Date(),
                    changePercent: changePercents
                }
            })
            console.log("Change Percent", changePercents, 'save to token :', item._id.toString())
            await rateLimitDelay(3000)
        } catch (error) {
            console.log("Get Change Percent Error: ", error)
        }
    }, {concurrency: 1})

    return true
}

// 1 minute
module.exports = cron.schedule("* * * * *", async () => {
    if (_store.isRunning) return true
    _store.isRunning = true

    try {
        console.log('Update price change percent at: ' + new Date())
        await updatePriceChangePercent()
    } catch (error) {
        console.log("ERROR", error)
    }

    _store.isRunning = false
}, {})

