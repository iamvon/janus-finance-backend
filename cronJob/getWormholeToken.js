require('dotenv').config();
const { TokenListProvider } = require('@solana/spl-token-registry')
const axios = require('axios')
const TokenModel = require('../models/token.model')
const WormholeTokenModel = require('../models/wormhole.model')
const db = require('../database')
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

const bcMap = {
    '1': 'Solana',
    '2': 'Ethereum',
    '3': 'Terra',
    '4': 'Binance Smart Chain',
    '5': 'Polygon',
    '6': 'Avalanche (C-Chain)',
    '7': 'Oasis (Emerald)',
}

const handleGetWormholeToken = async () => {
    console.log("Start fetching Wormhole tokens")
    const res = await axios.get('https://raw.githubusercontent.com/certusone/wormhole-token-list/main/src/markets.json')
    const listMarket = res.data["markets"]
    const listTokenMarket = res.data["tokenMarkets"]
    const listToken = res.data["tokens"]
    Object.keys(listTokenMarket).forEach(id => {
        const list = listTokenMarket[id]['1']
        curTokenList = listToken[id] 
        if(list) {
            Object.keys(list).forEach((curHash, index) => {
                const hash = curHash
                const symbol = curTokenList[curHash].symbol
                const logo = curTokenList[curHash].logo
                const market = list[curHash].markets.map(sl => {
                    return {
                        slug: sl,
                        link: listMarket[sl].link,
                        name: listMarket[sl].name
                    }
                })
                WormholeTokenModel.findOneAndUpdate({hash: curHash}, { $setOnInsert: {
                    hash: curHash,
                    symbol: symbol,
                    logo: logo,
                    market: market
                }}, { upsert: true, new: true}, (err, doc, raw) => {
                    if(index === Object.keys(list).length - 1) {
                        console.log(`Imported from bc ${bcMap[id]}: ${Object.keys(list).length}`)
                    }
                })
            })
        }
    })
}

const dbConnect = async () => {
    const urlConnection = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`
    const res = await db.connect(urlConnection)
}

const recursiveFunc = async () => {
    console.log("Task is running every 10 minutes " + new Date())
    await dbConnect()
    await handleGetWormholeToken()
    await new Promise(res => setTimeout(res, 1000*60*10))
    recursiveFunc()
}
    
recursiveFunc()    