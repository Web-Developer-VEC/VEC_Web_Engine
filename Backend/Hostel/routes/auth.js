const express = require('express');
const { Login, Logout, sendOTP, validateOTP, setNewPassword, DeleteWarden_Student } = require('../controllers/authController');
const { ensureAuthenticatedSuperior } = require('../middleware/authMiddelware');

const router = express.Router();

router.post('/login', Login);
router.get('/logout', Logout);
router.post('/send_otp', sendOTP);
router.post('/otp_validation', validateOTP);
router.post('/set_new_password', setNewPassword);
router.post('/delete_student', ensureAuthenticatedSuperior, DeleteWarden_Student);

module.exports = router;