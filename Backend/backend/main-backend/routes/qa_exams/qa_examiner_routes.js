const express = require('express');
const router = express.Router();
const { viewExamCode } = require('../../controllers/qa_controllers/qa_code_controllers/qa_code_view_controllers')
const { storeExamSchedule, cancelExamSchedule } = require('../../controllers/qa_controllers/qa_schedule_controllers/qa_exam_schedule_controllers');
const { allowRoles  } = require('../../middlewares/role_access_middleware')
const {exportMarks} = require('../../controllers/qa_controllers/qa_result_excel_controllers');
const {qa_form} = require('../../controllers/qa_controllers/qa_form_controllers/qa_form_controllers');




router.post('/exam_schedule', allowRoles("admin"), storeExamSchedule);
router.post('/exam_schedule/cancel', allowRoles("admin"), cancelExamSchedule)
router.get('/exam_code_view', allowRoles("admin","staff"), viewExamCode);
router.post('/form',allowRoles("admin"),qa_form);
router.post('/result',allowRoles('admin'),exportMarks);

module.exports = router;