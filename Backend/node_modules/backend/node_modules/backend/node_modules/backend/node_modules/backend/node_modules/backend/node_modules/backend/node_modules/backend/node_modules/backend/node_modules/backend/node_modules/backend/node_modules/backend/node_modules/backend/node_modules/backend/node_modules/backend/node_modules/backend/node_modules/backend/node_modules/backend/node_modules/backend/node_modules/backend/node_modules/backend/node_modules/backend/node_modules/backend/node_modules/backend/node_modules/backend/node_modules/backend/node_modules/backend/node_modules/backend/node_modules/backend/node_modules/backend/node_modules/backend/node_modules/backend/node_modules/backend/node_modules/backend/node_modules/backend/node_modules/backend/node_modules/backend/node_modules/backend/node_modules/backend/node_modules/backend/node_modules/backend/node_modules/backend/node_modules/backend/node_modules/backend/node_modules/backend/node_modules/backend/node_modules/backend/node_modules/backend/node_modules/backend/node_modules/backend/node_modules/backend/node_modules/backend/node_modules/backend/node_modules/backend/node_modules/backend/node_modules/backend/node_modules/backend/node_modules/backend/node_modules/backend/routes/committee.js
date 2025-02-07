const express = require('express');
const { getCommittee } = require('../controllers/committeeController');


const router = express.Router();

router.get('/committee', getCommittee);

module.exports = router;