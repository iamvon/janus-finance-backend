const express = require('express');
const api = express.Router();


/** 
 * Name the path with format /{router_name}/..., it automatic added 
 *
*/
api.get('/test', async (req, res) => {
    res.json({
        msg2: `Welcome to janus`,
    });
})

module.exports = api;