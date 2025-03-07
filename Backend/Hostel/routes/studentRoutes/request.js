const express = require('express');
const { ensureAuthenticatedStudent } = require('../../middleware/authMiddelware');
const upload = require('../../middleware/uploadMiddleware');
const { verifyStudent, submitPassParentApproval, submitPassWardenApproval, saveDraftData, fetchDraft, submitPassSuperiorWardenApproval, getPassDetailsByPassID, EditPassDetails } = require('../../controllers/studentController/requestController');

const router = express.Router();

router.post('/verify_student',ensureAuthenticatedStudent, verifyStudent);
router.post('/submit_pass_parent_approval', upload.single('file'), ensureAuthenticatedStudent, submitPassParentApproval);
router.post('/submit_pass_warden_approval', upload.single('file'), ensureAuthenticatedStudent, submitPassWardenApproval);
router.post('/submit_pass_warden_approval_superior', upload.single('file'), ensureAuthenticatedStudent, submitPassSuperiorWardenApproval);
router.post('/save_draft', upload.single('file'), ensureAuthenticatedStudent, saveDraftData);
router.post('/fetch_drafts', ensureAuthenticatedStudent, fetchDraft);
router.post('/edit_student_pass', upload.single('file'), ensureAuthenticatedStudent, EditPassDetails);
router.post('/get_student_pass_by_passid', ensureAuthenticatedStudent, getPassDetailsByPassID);

module.exports = router;