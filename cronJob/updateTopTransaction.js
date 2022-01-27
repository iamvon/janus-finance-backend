const cron = require('node-cron')
const {getModel} = require("../models")
const {getCoinGeckoChange, getCoinGeckoTrendingSearch, getCoinInfoFromId} = require("../library/coingecko")
const Promise = require('bluebird')
const {getSolscanTrendingSearch} = require("../library/solscan")
const {getJupiterTopTransaction} = require("../library/jup.ag")

const _store = {
    isRunning: false
}

// const BATCH_SIZE = 50
// const TIME_TO_UPDATE = 1000 * 60 *10

function rateLimitDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const updateTopTransaction = async () => {
    const SolanaToken = getModel("solana.model")

    const {topBuy, topSell} = await getJupiterTopTransaction()

    if (topSell.length > 0) {
        await SolanaToken.updateMany({isTopSell: true}, {$set: {isTopSell: false, topSellRank: 0}})
    }
    if (topBuy.length > 0) {
        await SolanaToken.updateMany({isTopBuy: true}, {$set: {isTopBuy: false, topBuyRank: 0}})
    }
    // console.log("Items", items)

    await Promise.map(topSell, async (item, index) => {
        try {
            await SolanaToken.updateOne({
                symbol: item.symbol,
            }, {
                $set: {
                    isTopSell: true,
                    topSellRank: index + 1
                }
            })
            // await rateLimitDelay(1000)
        } catch (error) {
            console.log("Set top Sell Error: ", error)
        }
    }, {concurrency: 4})

    await Promise.map(topBuy, async (item, index) => {
        try {
            await SolanaToken.updateOne({
                symbol: item.symbol,
            }, {
                $set: {
                    isTopBuy: true,
                    topBuyRank: index + 1
                }
            })
            // await rateLimitDelay(1000)
        } catch (error) {
            console.log("Set top Buy Error: ", error)
        }
    }, {concurrency: 4})


    return true
}

// 10 minutes
module.exports = cron.schedule("*/10 * * * *", async () => {
    if (_store.isRunning) return true
    _store.isRunning = true

    try {
        console.log('Update top transaction at: ' + new Date())
        await updateTopTransaction()
    } catch (error) {
        console.log("ERROR", error)
    }

    _store.isRunning = false
}, {})

