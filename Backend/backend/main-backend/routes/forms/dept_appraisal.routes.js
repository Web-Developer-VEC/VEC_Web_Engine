const express = require('express');
const s3UploadMiddleware = require('../../middlewares/appraisal_multer');
const { Appraisal, getAppraisal } = require('../../controllers/appraisal_controller');
const logError = require('../../middlewares/logerror');

const router = express.Router();


router.post("/appraisal_form", s3UploadMiddleware, Appraisal);
router.post("/appraisal_report", getAppraisal);



module.exports = router;

