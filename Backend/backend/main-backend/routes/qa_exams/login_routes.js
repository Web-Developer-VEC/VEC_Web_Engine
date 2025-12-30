const express = require('express');
const {signup , stafflogin, studentlogin} = require('../../controllers/qa_controllers/login_controllers')
const router = express.Router();

router.post('/signup',signup);
router.post('/stafflogin', stafflogin);
router.post('/studentlogin',studentlogin)

module.exports = router;