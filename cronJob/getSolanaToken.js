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
    const tokens = await new TokenListProvider().resolve()
    
    const tokenList = tokens.filterByClusterSlug('mainnet-beta').getList();
    
    const listTag = []

    console.log("Total Solana token need to import: ", tokenList.length);
    
    //fetch price from coingecko
    const listSymbol = []
    tokenList.forEach(t => {
        if(t.extensions && t.extensions.coingeckoId) listSymbol.push(t.extensions.coingeckoId)
    })
    console.log(listSymbol.length)
    const interval = 50
    let objPrice = {}
    for(let i = 0; i <= Math.floor(listSymbol.length/interval); i++){
        const newListSymbol = listSymbol.slice(i*interval, (i+1)*interval)
        // console.log(i, newListSymbol.length)
        const newString = newListSymbol.join(',')
        const {data: listPrice} = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${newString}&vs_currencies=usd&cb=${Date.now()}`)

        // console.log(listPrice)
        objPrice = {...objPrice, ...listPrice}
        console.log("List object price: ", Object.keys(objPrice).length)
    }

    //insert token data + price to mongodb
    tokenList.forEach((token, index) => {
        const coingeckoId = token.extensions && token.extensions.coingeckoId ? token.extensions.coingeckoId : ""
        token.tags && coingeckoId !== "" && token.tags.forEach(t => {
            if(!listTag.find(t1 => t1 === t)){
                listTag.push(t)
            } 
        })
        SolanaModel.findOneAndUpdate({address: token.address}, {
            chainId: token.chainId,
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoURI: token.logoURI,
            price: objPrice[coingeckoId] && objPrice[coingeckoId]['usd'] ? objPrice[coingeckoId]['usd'] : 0,
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

// const handleGetToken = async () => {
//     console.log("Start fetching Solana tokens")
//     let url = "https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?limit=1000&tagSlugs=solana-ecosystem"

//     axios.get(url).then(async res => {

//         const listTag = []

//         const tokenList = res.data['data']['cryptoCurrencyList']

//         console.log("Total Solana token need to import: ", tokenList.length);
//         let listSymbol = tokenList.map(t => t.symbol)
//         listSymbol = listSymbol.join(',')
//         const listData = await getCoinData(listSymbol)
//         console.log(listData.length)
//         // console.log(res)
//         tokenList.forEach((token, index) => {
//             const curTokenData = listData.find(d => d.symbol === token.symbol)
//             if(curTokenData && curTokenData.category){
//                 if(!listTag.find(t1 => t1 === curTokenData.category)){
//                     listTag.push(curTokenData.category)
//                 }
//             }
//             // console.log(token.quotes[0].price)
//             TokenModel.findOneAndUpdate({cid: token.id}, { 
//                 cid: token.id,
//                 symbol: token.symbol,
//                 name: token.name,
//                 slug: token.slug,
//                 price: token.quotes[0].price,
//                 tag: curTokenData ? curTokenData.category : token.tags,
//             }, { upsert: true, new: true }, (err, doc, raw) => {
//                 if(err) console.log(err)
//                 if(index % 10 === 0) console.log(index)
//                 if(index === tokenList.length - 1) console.log("Total Solana token inserted: ", index + 1)
//             })
//             // newToken.save().then()
//         })
//         console.log("Total tag need to import: ", listTag.length)
//         listTag.forEach((tag, index) => {
//             TagModel.findOneAndUpdate({name: tag}, { $setOnInsert: { name: tag }}, {upsert: true, new: true}, (err, doc, raw) => {
//                 if(index === listTag.length - 1) console.log(`Imported ${index + 1} tags`)
//             })
//         })
//     });
// }

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