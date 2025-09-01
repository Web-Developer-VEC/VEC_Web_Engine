const express = require("express");
const authMiddleware = require('../middleware/auth_middleware')


const router = express.Router();

router.get('/:collectionName/request',authMiddleware);

module.exports=router;
