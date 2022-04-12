const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TransactionSchema = new Schema(
    {
        cid: {
            type: String,
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
        slug: {
            type: String,
            index: true,
            default: ""
        },
        tag: {
            type: [String],
            index: true,
            default: []
        },
        price: {
            type: Number
        }
    },
    { timestamps: true }
)

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
