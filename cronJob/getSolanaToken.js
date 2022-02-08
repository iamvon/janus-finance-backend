require('dotenv').config();
const axios = require('axios')
const TagModel = require('../models/tag.models')
const { TokenListProvider } = require('@solana/spl-token-registry')
const TokenModel = require('../models/token.model')
const SolanaModel = require('../models/solana.model')
const db = require('../database');
const { getCoinData } = require('../library/cryptorank')
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
    console.log("Start fetching Solana tokens")
    const [tokens, {data: listCoingeckoToken}] = await Promise.all([new TokenListProvider().resolve(), axios.get('https://api.coingecko.com/api/v3/coins/list?asset_platform_id=solana')])
    
    const tokenList = tokens.filterByClusterSlug('mainnet-beta').getList();
    
    const listTag = []

    console.log("Total Solana token need to import: ", tokenList.length);
    console.log("Total Coingecko token: ", listCoingeckoToken.length);
    
    //fetch price from coingecko
    const listSymbol = listCoingeckoToken.map(t => t.id)
    tokenList.forEach(t => {
        if(t.extensions && t.extensions.coingeckoId && !listSymbol.find(s => s == t.extensions.coingeckoId)) listSymbol.push(t.extensions.coingeckoId)
    })

    console.log(listSymbol.length)
    const interval = 50
    let arrayPrice = []
    for(let i = 0; i <= Math.floor(listSymbol.length/interval); i++){
        const newListSymbol = listSymbol.slice(i*interval, (i+1)*interval)
        // console.log(i, newListSymbol.length)
        const newString = newListSymbol.join(',')
        try{
            const {data: listPrice} = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${newString}&per_page=100&page=1&sparkline=false&cb=${Date.now()}`)
        }
        catch(e) {
            console.log(e)
        }
        

        // console.log(listPrice.length)
        arrayPrice = arrayPrice.concat(listPrice)

        console.log("List object price: ", arrayPrice.length)
    }

    //insert token data + price to mongodb
    tokenList.forEach((token, index) => {
        const coingeckoId = token.extensions && token.extensions.coingeckoId ? token.extensions.coingeckoId : ""
        token.tags && coingeckoId !== "" && token.tags.forEach(t => {
            if(!listTag.find(t1 => t1 === t)){
                listTag.push(t)
            } 
        })
        const tokenData = arrayPrice.find(t => t.id == coingeckoId || (t.name.toLowerCase() == token.name.toLowerCase() && t.symbol.toLowerCase() == token.symbol.toLowerCase()))
        SolanaModel.findOneAndUpdate({address: token.address}, {
            chainId: token.chainId,
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoURI: token.logoURI,
            price: tokenData ? tokenData['current_price'] : 0,
            marketcap: tokenData ? tokenData['market_cap'] : 0,
            volume: tokenData ? tokenData['total_volume'] : 0,
            tag: token.tags ? token.tags : [],
            extensions: token.extensions ? token.extensions : {}
        }, { upsert: true, new: true }, (err, doc, raw) => {
            if(err) console.log(err)
            if(index % 100 === 0) console.log(index)
            if(index === tokenList.length - 1) console.log("Total Solana token inserted: ", index + 1)
        })
    })
    console.log("Total tag need to import: ", listTag.length)
    listTag.forEach((tag, index) => {
        TagModel.findOneAndUpdate({name: tag}, { $setOnInsert: { name: tag }}, {upsert: true, new: true}, (err, doc, raw) => {
            if(index === listTag.length - 1) console.log(`Imported ${index + 1} tags`)
        })
    })

    // let url = "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json"
    // let url = "https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?limit=1000&tagSlugs=solana-ecosystem"
}

const dbConnect = async () => {
    const urlConnection = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    const res = await db.connect(urlConnection)
    
}

const recursiveFunc = async () => {
    console.log("Task is running every 2 minutes " + new Date())
    await dbConnect()
    await handleGetToken()
    await new Promise(res => setTimeout(res, 1000*60*2))
    await db.close()
    recursiveFunc()
}
    
recursiveFunc()    