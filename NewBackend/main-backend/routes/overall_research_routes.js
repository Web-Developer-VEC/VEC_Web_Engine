const express = require('express');
const { getOverallResearchData, getPatent, getConference, getJournal, getBooks } = require('../controllers/overall_research_controllers');

const router = express();

// router.post('/get_research_data', getOverallResearchData);
router.get('/patent', getPatent);
router.get('/conference', getConference);
router.get('/journal', getJournal);
router.get('/books', getBooks);

module.exports = router;