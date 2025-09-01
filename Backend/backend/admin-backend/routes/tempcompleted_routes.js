const express = require("express");
const router = express.Router();
const {getTempCompleted} = require('../middlewares/approve_middleware') ;

router.get('/:collectionName/completed',getTempCompleted);

module.exports = router;