const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TestSchema = new Schema(
    {
        name: String,
    },
    { timestamps: true }
)

const Test = mongoose.model("Test", TestSchema);

module.exports = Test;
