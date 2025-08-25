const express = require('express');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const {DeptMiddleware,getsidebar} = require ('../../controllers/department_controllers')
const { allowedtypes, ALLOWED_DEPARTMENTS } = require('../../models/top_navbar/department_models');
const hitTracker = require('../../middlewares/hit_tracker')

const limiter = createRateLimiter({ max: 2500, windowMs: 10 * 60 * 1000 });
const router = express.Router();
// Define department routes
router.post('/department', limiter, xss,hitTracker,  DeptMiddleware(allowedtypes,ALLOWED_DEPARTMENTS));
router.get('/:deptId/sidebar' ,limiter, xss,hitTracker,  getsidebar);

module.exports = router;
