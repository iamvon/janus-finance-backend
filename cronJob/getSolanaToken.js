require('dotenv').config();
const { TokenListProvider } = require('@solana/spl-token-registry')
const TokenModel = require('../models/token.model')
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
    console.log("Start fetching Solana tokens")
    new TokenListProvider().resolve().then((tokens) => {
        const tokenList = tokens.filterByClusterSlug('mainnet-beta').getList();
        console.log("Total Solana token need to import: ", tokenList.length);
        tokenList.forEach((token, index) => {
            TokenModel.findOneAndUpdate({address: token.address}, { $setOnInsert: {
                chainId: token.chainId,
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                logoURI: token.logoURI,
                tag: token.tags ? token.tags : [],
                extensions: token.extensions ? Object.keys(token.extensions).map(key => {
                    return {
                        name: key,
                        value: token.extensions[key]
                    }
                }) : []
            }}, { upsert: true, new: true }, (err, doc, raw) => {
                if(err) console.log(err)
                if(index % 100 === 0) console.log(index)
                if(index === tokenList.length - 1) console.log("Total Solana token inserted: ", index + 1)
            })
            // newToken.save().then()
        })
    });
}

const dbConnect = async () => {
    const urlConnection = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    const res = await db.connect(urlConnection)
    console.log(res)
}

const recursiveFunc = async () => {
    console.log("Task is running every 10 minutes " + new Date())
    await dbConnect()
    await handleGetToken()
    await new Promise(res => setTimeout(res, 1000*60*30))
    recursiveFunc()
}
    
recursiveFunc()    