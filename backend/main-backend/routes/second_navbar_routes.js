const express = require('express');
const { getNaac, getNba, getNirf, getiic, getIqac, getECell, iicApplyForm } = require('../controllers/second_navbar_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/naac', limiter, getNaac);
router.get('/nba', limiter, getNba);
router.get('/nirf', limiter, getNirf);
router.get('/iic', limiter, getiic);
router.get('/iqac', limiter, getIqac);
router.get('/ecell', limiter, getECell);
router.post('/iic_applynow', limiter, iicApplyForm);

module.exports = router;