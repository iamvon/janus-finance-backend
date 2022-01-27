const axios = require('axios');

const getCoinGeckoChange = async (coinId, time, currency = 'usd') => {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=${currency}&days=${time}`
        const priceResp = await axios({
            method: 'GET',
            timeout: 10000,
            url: url
        })

        const priceData = await priceResp.data
        const firstPrice = priceData[0][4]
        const secondPrice = priceData[priceData.length - 1][4]
        const change = (secondPrice - firstPrice) / firstPrice * 100
        // console.log(firstPrice, secondPrice, change)
        return change.toFixed(2)
    } catch (error) {
        console.log('getCoinGeckoChange ERROR', error.message)
        return 0
    }
};

const getCoinInfoFromId = async (coinId) => {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}`
        const priceResp = await axios({
            method: 'GET',
            timeout: 10000,
            url: url
        })

        return priceResp.data
    } catch (error) {
        console.log('getCoinInfoFromId ERROR', error.message)
        return 0
    }
};

const getCoinGeckoTrendingSearch = async () => {
    try {
        const url = `https://api.coingecko.com/api/v3/search/trending?asset_platform_id=solana`
        const priceResp = await axios({
            method: 'GET',
            timeout: 5000,
            url: url
        })

        const resData = priceResp.data
        const coins = resData.coins
        // console.log(coins)

        return coins.map(c => {
            return {
                symbol: c.item.symbol,
                id: c.item.id,
            }
        })
    } catch (error) {
        console.log('getCoinGeckoChange ERROR', error.message)
        return 0
    }
};


module.exports = {
    getCoinGeckoChange,
    getCoinGeckoTrendingSearch,
    getCoinInfoFromId
}
