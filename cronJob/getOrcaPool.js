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
    console.log("Start fetching Orca pool")
    const {data: poolList} = await axios.get(`https://api.orca.so/allPools?cb=${Date.now()}`)
    // console.log(poolList)
    console.log("Total Orca pool need to import: ", Object.keys(poolList).length);

    Object.keys(poolList).forEach((pair, index) => {
        const pool = poolList[pair]
        // console.log(pool.fee_24h)
        PoolModel.findOneAndUpdate({liquidity_pool: pool.poolAccount}, {
            platform: "Orca",
            liquidity_pool: pool.poolAccount,
            liquidity: 0,
            volume: pool.volume.week !== "Nan" ? pool.volume.week : 0,
            lp_fee: 0,
            asset: pool.poolId.split('[')[0],
            apy: pool.apy.week != "NaN" ? pool.apy.week : 0
        }, { upsert: true, new: true }, (err, doc, raw) => {
            if(err) console.log(err)
            // if(index % 10 === 0) console.log(index)
            if(index === Object.keys(poolList).length - 1) console.log("Total Orca pool inserted: ", index + 1)
        })
    })
}
const dbConnect = async () => {
    const urlConnection = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    const res = await db.connect(urlConnection)
    
}

const recursiveFunc = async () => {
    console.log("Task get Orca pool is running every 10 minutes " + new Date())
    // await dbConnect()
    await handleGetToken()
    await new Promise(res => setTimeout(res, 1000*60*10))
    await db.close()
    recursiveFunc()
}
    
module.exports = recursiveFunc()