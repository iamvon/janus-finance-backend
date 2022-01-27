const cron = require('node-cron')
const {getModel} = require("../models")
const {getCoinGeckoTrendingSearch, getCoinInfoFromId} = require("../library/coingecko")
const Promise = require('bluebird')
const {getSolscanTrendingSearch} = require("../library/solscan")

const _store = {
    isRunning: false
}

// const BATCH_SIZE = 50
// const TIME_TO_UPDATE = 1000 * 60 *10

function rateLimitDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const updateTopTrending = async () => {
    const SolanaToken = getModel("solana.model")

    const coingeckoTrends = await getCoinGeckoTrendingSearch()
    const solscanTrends = await getSolscanTrendingSearch()

    if (coingeckoTrends.length + solscanTrends.length > 8) {
        await SolanaToken.updateMany({isTopTrending: true}, {$set: {isTopTrending: false, topTrendingRank: 0}})
    }

    // console.log("Items", items)

    await Promise.map(coingeckoTrends, async (item, index) => {
        try {
            const coinInfo = await getCoinInfoFromId(item.id)
            const address = coinInfo.platforms.solana
            console.log("Top Trending Coin Address", coinInfo.platforms.solana)
            await SolanaToken.updateOne({
                symbol: item.symbol,
                address: address
            }, {
                $set: {
                    isTopTrending: true,
                    topTrendingRank: index + 1
                }
            })
            await rateLimitDelay(1000)
        } catch (error) {
            console.log("Set top Trending Error: ", error)
        }
    }, {concurrency: 4})

    // console.log("Items", solscanTrends)

    await Promise.map(solscanTrends, async (address, index) => {
        // console.log(index)
        try {
            await SolanaToken.updateOne({
                address: address,
                isTopTrending: false,
            }, {
                $set: {
                    isTopTrending: true,
                    topTrendingRank: index + 8
                }
            })
        } catch (error) {
            console.log("Set top Trending Error: ", error)
        }
    }, {concurrency: 4})

    return true
}

// 3 minutes
module.exports = cron.schedule("*/3 * * * *", async () => {
    if (_store.isRunning) return true
    _store.isRunning = true

    try {
        console.log('Update top trending at: ' + new Date())
        await updateTopTrending()
    } catch (error) {
        console.log("ERROR", error)
    }

    _store.isRunning = false
}, {})

