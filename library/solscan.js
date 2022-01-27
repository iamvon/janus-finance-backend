const axios = require('axios');

const getSolscanTrendingSearch = async () => {
    try {
        const url = `https://api.solscan.io/token/tokenTrending`
        const priceResp = await axios({
            method: 'GET',
            timeout: 5000,
            url: url
        })

        const resData = priceResp.data
        const coins = resData.data
        // console.log(coins)
        return coins.map(c => c.token)
    } catch (error) {
        console.log('getCoinGeckoChange ERROR', error.message)
        return 0
    }
};

module.exports = {
    getSolscanTrendingSearch,
}
