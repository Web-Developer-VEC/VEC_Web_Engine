const express = require('express');

const router = express.Router();

const {qa_form} = require('../../controllers/qa_controllers/qa_form_controllers');

router.get('/form',qa_form);

module.exports = router;