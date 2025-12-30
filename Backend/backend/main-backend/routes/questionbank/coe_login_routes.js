const express = require('express');

const { coelogin} = require('../../controllers/questionbank_controllers/coe_login_controllers');


const router = express.Router();


router.post('/coelogin',  coelogin);

    
module.exports = router;