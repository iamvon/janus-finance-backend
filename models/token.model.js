const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TokenSchema = new Schema(
    {
        chainId: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            unique: true,
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
        tag: [{
            type: String,
            index: true
        }],
        extensions: [{
            name: {
                type: String
            },
            value: {
                type: String
            }
        }]
    },
    { timestamps: true }
)

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
