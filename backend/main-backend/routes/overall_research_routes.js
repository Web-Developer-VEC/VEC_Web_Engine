const express = require('express');
const { getOverallResearchData, getPatent, getConference, getJournal, getBooks } = require('../controllers/overall_research_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express();

// router.post('/get_research_data', getOverallResearchData);
router.get('/patent', limiter, getPatent);
router.get('/conference', limiter, getConference);
router.get('/journal', limiter, getJournal);
router.get('/books', limiter, getBooks);

module.exports = router;