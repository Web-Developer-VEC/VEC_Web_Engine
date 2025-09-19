const express = require("express");
const router = express.Router();

const {getTempRequests , getTempRequestAdmin} = require('../../middlewares/temprequest_middleware');
const { getTempCompleted } = require("../../middlewares/tempcomplete_middleware");

router.get('/request',getTempRequests);

router.get('/completed',getTempCompleted);

router.get('/adminrequest',getTempRequestAdmin);

module.exports = router;