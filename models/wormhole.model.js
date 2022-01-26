const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const WormholeToken = new Schema(
    {
        symbol: {
            type: String,
            default: "",
            index: true,
            unique: true
        },
        logo: {
            type: String,
            default: ""
        },
        hash: {
            type: String,
            default: "",
            index: true
        },
        market: [{
            type: Object,
            default: {}
        }],
        
    },
    { timestamps: true }
)


module.exports = mongoose.model("WormholeToken", WormholeToken);
