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

module.exports = {
    getCoinGeckoChange
}
