const express = require('express');
const { heartbeat, ping } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_heartbeat_controller');
const { getRemainingTime } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_time_comtroller');
const { markOffline, resumeSession, getResumeData, getResumeQuestions } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_offline_controller');
const { registerViolation } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_violation_controller');
const { getSessionStatus } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_status_controller');
const requireAuth = require('../../middlewares/qa middleware/requireAuth');
const loadExamSession = require('../../middlewares/qa middleware/loadExamSession');
const requireActiveSession = require('../../middlewares/qa middleware/requireActiveSession');
const { startExam } = require('../../controllers/qa_controllers/qa_exam_controller/qa_exam_start_controller');
const router = express.Router();

// router.use("/qa/session", requireAuth, loadExamSession);

router.get("/qa/session/ping", ping);
router.post("/qa/session/start-exam", requireAuth, startExam);
router.post("/qa/session/heartbeat", loadExamSession, requireActiveSession, heartbeat);
router.post("/qa/session/offline", requireAuth,loadExamSession, markOffline); 
router.post("/qa/session/resume", requireAuth,loadExamSession, resumeSession); 
router.post("/qa/session/violation",loadExamSession, requireActiveSession, registerViolation);
router.get('/qa/session/status', requireAuth,loadExamSession,requireActiveSession, getSessionStatus);
router.get('/qa/session/time', loadExamSession,requireActiveSession, getRemainingTime);
router.get("/qa/session/resume-data", requireAuth, loadExamSession, getResumeData);
router.get("/qa/session/questions", requireAuth, loadExamSession, getResumeQuestions);

module.exports = router