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
    console.log("Start fetching Aldrin pool")
    const {data: {getPoolsInfo: poolList}} = await axios.get('https://api.step.finance/v1/integration/aldrin')
    // console.log(poolList)
    console.log("Total Aldrin pool need to import: ", poolList.length);

    poolList.forEach((pool, index) => {
        // console.log(pool.fee_24h)
        PoolModel.findOneAndUpdate({liquidity_pool: pool.swapToken}, {
            platform: "Aldrin",
            liquidity_pool: pool.swapToken,
            liquidity: 0,
            volume: 0,
            lp_fee: 0,
            asset: pool.parsedName.split('_').map(t => {
                if(t.includes('...')) return "unknown"
                else return t
            }).join('/'),
            apy: pool.apy24h
        }, { upsert: true, new: true }, (err, doc, raw) => {
            if(err) console.log(err)
            if(index % 10 === 0) console.log(index)
            if(index === poolList.length - 1) console.log("Total Aldrin pool inserted: ", index + 1)
        })
    })
}
const dbConnect = async () => {
    const urlConnection = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    const res = await db.connect(urlConnection)
    
}

const recursiveFunc = async () => {
    console.log("Task is running every 10 minutes " + new Date())
    await dbConnect()
    await handleGetToken()
    await new Promise(res => setTimeout(res, 1000*60*10))
    await db.close()
    recursiveFunc()
}
    
recursiveFunc()    