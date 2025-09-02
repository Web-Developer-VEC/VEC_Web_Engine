const express = require("express");
const router = express.Router();
const {getTempCompleted} = require('../middlewares/tempcomplete_middleware') ;

router.get('/completed',getTempCompleted);

module.exports = router;