const express = require('express');
const s3UploadMiddleware = require('../../middlewares/appraisal_multer');
const { Appraisal, getAppraisal } = require('../../controllers/appraisal_controller');
const logError = require('../../middlewares/logerror');
const generateAppraisalDoc = require('../../controllers/appraisal_report');

const router = express.Router();


router.post("/appraisal_form", s3UploadMiddleware, Appraisal);
router.post("/get_appraisal_data", getAppraisal);

router.post("/appraisal_doc_without_proof", (req, res, next) => {
    req.body.include_proof = false;
    req.body.report_type = "download";
    return generateAppraisalDoc(req, res, next);
});
router.post("/appraisal_doc_view_with_proof", (req, res, next) => {
    req.body.include_proof = true;
    req.body.report_type = "download";
    return generateAppraisalDoc(req, res, next);
});

module.exports = router;

