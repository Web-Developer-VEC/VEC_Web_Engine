const express = require('express');
const { getIicSection, getIqacSection, getECellSection, iicApplyForm , getAccreditationSection, getIncubationSection , getTransportSection , getOtherFacilitiesSection } = require('../controllers/second_navbar_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const sanitize = require('../middlewares/sanitizers/sanitize_second_navbar');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/accreditation', limiter, xss, getAccreditationSection);
router.post('/iic', limiter, xss, getIicSection);
router.post('/iqac', limiter, xss, getIqacSection);
router.post('/incubation', limiter, xss, getIncubationSection);
router.post('/ecell', limiter, xss, getECellSection);
router.post('/transport', limiter, xss, getTransportSection);
router.post('/other_facilities', limiter, xss, getOtherFacilitiesSection);
router.post('/iic_applynow', limiter, xss, sanitize, iicApplyForm);

module.exports = router;