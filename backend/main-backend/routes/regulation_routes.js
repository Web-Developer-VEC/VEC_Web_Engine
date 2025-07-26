const express = require('express');
const { getRegulation, getCurriculumandSyllabus } = require('../controllers/regulation_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });


const router = express.Router();

router.get('/regulation', limiter, xss, getRegulation);
router.get('/curriculumandsyllabus', limiter, xss, getCurriculumandSyllabus)

module.exports = router;