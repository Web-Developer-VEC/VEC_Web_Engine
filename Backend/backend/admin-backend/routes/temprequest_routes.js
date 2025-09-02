const express = require("express");
const { getTempRequests } = require("../middlewares/temprequest_middleware");



const router = express.Router();

router.get('/request',getTempRequests);

module.exports=router;
