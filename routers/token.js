const express = require('express');
const router = express.Router();
const tokenController = require('../controller/tokenController')

router.get('/solana', tokenController.getSolanaToken)
router.get('/wormhole', tokenController.getWormholeToken)

module.exports = router;