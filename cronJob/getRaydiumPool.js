require('dotenv').config();
const axios = require('axios')
const { TokenListProvider } = require('@solana/spl-token-registry')
const PoolModel = require('../models/pool.model')
const db = require('../database');
const {
    MONGODB_USER, 
    MONGODB_PASS, 
    MONGODB_IP, 
    MONGODB_PORT, 
    MONGODB_DATABASE, 
    PORT, 
    PROJECT_NAME,
    API_PREFIX
} = process.env


const handleGetToken = async () => {
    console.log("Start fetching Raydium pool")
    const {data: poolList} = await axios.get('https://api.raydium.io/pairs')
    // console.log(poolList)
    console.log("Total Raydium pool need to import: ", poolList.length);

    poolList.forEach((pool, index) => {
        // console.log(pool.fee_24h)
        PoolModel.findOneAndUpdate({liquidity_pool: pool.amm_id}, {
            platform: "Raydium",
            liquidity_pool: pool.amm_id,
            liquidity: pool.liquidity,
            volume: pool.volume_24h,
            lp_fee: pool.fee_24h,
            asset: pool.name.split('-').join('/'),
            apy: pool.apy
        }, { upsert: true, new: true }, (err, doc, raw) => {
            if(err) console.log(err)
            if(index % 100 === 0) console.log(index)
            if(index === poolList.length - 1) console.log("Total Raydium pool inserted: ", index + 1)
        })
    })
}
const dbConnect = async () => {
    const urlConnection = `mongodb://${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    const res = await db.connect(urlConnection)
    
}

const recursiveFunc = async () => {
    console.log("Task getRaydiumPool is running every 10 minutes " + new Date())
    // await dbConnect()
    await handleGetToken()
    await new Promise(res => setTimeout(res, 1000*60*10))
    // await db.close()
    recursiveFunc()
}
    
module.exports = recursiveFunc()