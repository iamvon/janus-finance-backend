var mongoose = require('mongoose')

const solanaMetaSchema = mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    logline: {
        type: String,
        required: true
    },
    cta: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    website: {
        type: String,
    },
    twitter: {
        type: String,
    },
    telegram: {
        type: String,
    },
    discord: {
        type: String,
    },
    logo: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, {
    timestamp: true
}) 

module.exports = mongoose.model('solanameta', solanaMetaSchema, "solanameta")