const express = require('express');
const { getNaac, getNba, getNirf, getiic, getIqac, getECell, iicApplyForm } = require('../controllers/second_navbar_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const sanitize = require('../middlewares/sanitizers/sanitize_second_navbar');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/naac', limiter, xss, getNaac);
router.get('/nba', limiter, xss, getNba);
router.get('/nirf', limiter, xss, getNirf);
router.get('/iic', limiter, xss, getiic);
router.get('/iqac', limiter, xss, getIqac);
router.get('/ecell', limiter, xss, getECell);
router.post('/iic_applynow', limiter, xss, sanitize, iicApplyForm);

module.exports = router;