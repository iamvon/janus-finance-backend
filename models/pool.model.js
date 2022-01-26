const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const PoolSchema = new Schema(
    {
        platform: {
            type: String
        },
        liquidity_pool: {
            type: String,
            unique: true
        },
        liquidity: {
            type: Number,
            default: 0
        },
        volume: {
            type: Number,
            default: 0
        },
        lp_fee: {
            type: Number,
            default: 0
        },
        asset: {
            type: String
        },
        apy: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
)

const Pool = mongoose.model("pool", PoolSchema, "pool");

module.exports = Pool;
