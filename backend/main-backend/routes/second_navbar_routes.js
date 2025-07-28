const express = require('express');
const { getIicSection, getIqacSection, getECellSection, iicApplyForm , getAccreditationSection, getIncubationSection , getTransportSection , getOtherFacilitiesSection } = require('../controllers/second_navbar_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const sanitize = require('../middlewares/sanitizers/sanitize_second_navbar');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/accreditation', limiter, xss, nosql, getAccreditationSection);
router.post('/iic', limiter, xss,nosql, getIicSection);
router.post('/iqac', limiter, xss,nosql, getIqacSection);
router.post('/incubation', limiter, xss, nosql, getIncubationSection);
router.post('/ecell', limiter, xss, nosql, getECellSection);
router.post('/transport', limiter, xss,nosql, getTransportSection);
router.post('/other_facilities', limiter, xss,nosql, getOtherFacilitiesSection);
router.post('/iic_applynow', limiter, xss, sanitize,nosql, iicApplyForm);

module.exports = router;