const TokenModel = require('../models/token.model')
const WormholeModel = require('../models/wormhole.model')

module.exports.getSolanaToken = async (req, res) => {
    try{
        const listToken = await TokenModel.find({})
        console.log(listToken.length)
        res.send({
            listSolanaToken: listToken
        })
    }
    catch(e){
        console.log(e)
    }
}

module.exports.getWormholeToken = async (req, res) => {
    try{
        const listToken = await WormholeModel.find({})
        console.log(listToken.length)
        res.send({
            listWormholeToken: listToken
        })
    }
    catch(e){
        console.log(e)
    }
}