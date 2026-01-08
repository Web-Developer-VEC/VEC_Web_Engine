const express = require('express');
const {signup , stafflogin, studentlogin} = require('../../controllers/qa_controllers/login_controllers');
const { getStudent } = require('../../controllers/qa_controllers/qa_form_controllers/qa_studentform_controllers');
const router = express.Router();

router.post('/signup',signup);
router.post('/stafflogin', stafflogin);
router.post('/studentlogin',studentlogin);
router.get('/qastudentform',getStudent)

module.exports = router;