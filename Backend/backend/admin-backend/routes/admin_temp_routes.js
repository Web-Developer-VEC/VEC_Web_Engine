const express = require("express");
const router = express.Router();

const {getTempRequests} = require('../middlewares/temprequest_middleware');
const { getTempCompleted } = require("../middlewares/tempcomplete_middleware");

router.get('/request',getTempRequests);

router.get('/completed',getTempCompleted);

module.exports = router;