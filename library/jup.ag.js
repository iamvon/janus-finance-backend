const axios = require('axios');

const getJupiterTopTransaction = async () => {
    try {
        const url = `https://stats.jup.ag/info/day`
        const priceResp = await axios({
            method: 'GET',
            timeout: 5000,
            url: url
        })

        const resData = priceResp.data
        const lastXTopSell = resData.lastXTopSell
        const lastXTopBuy = resData.lastXTopBuy
        return {
            topSell: lastXTopSell.slice(0, 30),
            topBuy: lastXTopBuy.slice(0, 30)
        }
    } catch (error) {
        console.log('getCoinGeckoChange ERROR', error.message)
        return 0
    }
};

module.exports = {
    getJupiterTopTransaction,
}
