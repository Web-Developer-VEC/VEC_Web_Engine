const express = require('express');
const { getCommittee, getHandbook } = require('../controllers/committeeController');


const router = express.Router();

router.get('/committee', getCommittee);
router.get('/handbook', getHandbook)

module.exports = router;