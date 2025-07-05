const express = require('express');
const { getChatBotResponce } = require('../controller/chatbotController');

router = express()

router.post('/ask', getChatBotResponce)

module.exports = router;