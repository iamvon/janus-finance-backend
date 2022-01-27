const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TokenSchema = new Schema(
    {
        chainId: {
            type: String,
            default: ""
        },
        price: {
            type: Number
        },
        address: {
            type: String,
            unique: true,
            index: true,
            default: ""
        },
        symbol: {
            type: String,
            index: true,
            default: ""
        },
        name: {
            type: String,
            index: true,
            default: ""
        },
        decimals: {
            type: Number
        },
        logoURI: {
            type: String,
            default: ""
        },
        tag: {
            type: [String],
            index: true,
            default: []
        },
        extensions: {
            type: Object,
            default: {}
        },
        changePercent: {
            t24h: {
                type: Number,
                index: true,
            },
            t7d: {
                type: Number,
                index: true,
            },
            t1m: {
                type: Number,
                index: true,
            },
        },
        lastChangePercentUpdated: {
            type: Date,
            index: true,
        }
    },
    {timestamps: true}
)

TokenSchema.index({name: 'text', address: 'text', symbol: 'text'});

const Token = mongoose.model("Solana", TokenSchema, "Solana");

module.exports = Token;
