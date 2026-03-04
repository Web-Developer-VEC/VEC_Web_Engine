const express = require('express');
const { s3UploadMiddleware } = require('../../middlewares/appraisal_multer');
const { Appraisal, getAppraisal } = require('../../controllers/Appraisal_controller/appraisal_controller');
const logError = require('../../middlewares/logerror');
const generateAppraisalDoc = require('../../controllers/Appraisal_controller/appraisal_report');

const router = express.Router();


router.post("/appraisal_form", s3UploadMiddleware, Appraisal);
router.post("/get_appraisal_data", getAppraisal);

router.post("/appraisal_doc_without_proof", generateAppraisalDoc);
router.post("/appraisal_doc_with_proof", generateAppraisalDoc);

module.exports = router;

