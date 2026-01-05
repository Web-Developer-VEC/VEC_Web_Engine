const express = require('express');
const { heartbeat } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_heartbeat_controller');
const { getRemainingTime } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_time_comtroller');
const { markOffline, resumeSession, getResumeData } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_offline_controller');
const { registerViolation } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_violation_controller');
const { getSessionStatus } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_status_controller');
const requireAuth = require('../../middlewares/qa middleware/requireAuth');
const loadExamSession = require('../../middlewares/qa middleware/loadExamSession');
const requireActiveSession = require('../../middlewares/qa middleware/requireActiveSession');
const router = express.Router();

router.use("/qa/session", requireAuth, loadExamSession);

router.post("/qa/session/heartbeat", requireActiveSession, heartbeat);
router.post("/qa/session/offline", requireActiveSession, markOffline);
router.post("/qa/session/resume", requireActiveSession, resumeSession);
router.post("/qa/session/violation", requireActiveSession, registerViolation);
router.get('/qa/session/status', getSessionStatus );
router.get('/qa/session/time', getRemainingTime );
router.get(
  "/qa/session/resume-data",
  requireAuth,
  loadExamSession,
  getResumeData
);

module.exports = router