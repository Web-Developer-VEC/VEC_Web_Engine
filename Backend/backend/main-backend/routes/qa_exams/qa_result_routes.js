const express = require('express');

const {qaresult} = require('../../controllers/qa_controllers/qa_result_controllers');

const router = express.Router();

router.post('/submit',qaresult);

module.exports = router;