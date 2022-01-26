const axios = require('axios');
const { cryptorankKey } = require("./listApiKey");

const apiKey = "11a306c0ecb2430778a7d890f39a69d6d59832a8f27f501e6022f09fc554"

module.exports.getCoinData = async (listSymbol) => {
    let index = 0;
    for(const key of cryptorankKey){
        index += 1;
        console.log(index, " - ", key)
        try{
            const res = await axios({
                method: 'get',
                timeout: 5000,
                url: `https://api.cryptorank.io/v1/currencies?offset=0&limit=1000&api_key=${key}&symbols=${listSymbol}&cb=${Date.now()}`
            })
            
            // console.log(res.data.data)
            if(res.data.status.success){
                // console.log(res.data.data[0])
                // res.data.data.forEach(token => {
                //     if(token.slug === 'bitcoin') console.log(token)
                // });
                // console.log(res)
                // console.log(`${offset} - ${offset + limit}: Done.\n`)
                return res.data.data
            }
            else console.log(res.data.status.message)
        }
        catch(e) {
            // console.log("code: ", e.code)
            console.log("mesage: ", e.message)
            // console.log("stack: ", e.stack)
            if(e.code == "ECONNABORTED"){
                // console.log(`${offset} - ${offset + limit}: Timed out. Reconnecting...`)
                console.log("reconnect")
                return this.getCoinData(listSymbol)
            }
            // else if(e.response && e.response.data.status.code === 429){
            //     console.log("API key limit")
            //     continue;
            // }
            // else console.log(e)
        }
    }
}

// getCoinAmount()