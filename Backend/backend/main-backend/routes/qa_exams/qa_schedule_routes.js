const express = require('express');
const router = express.Router();
const { viewExamCode } = require('../../controllers/qa_controllers/qa_code_view_controllers')
const { storeExamSchedule, cancelExamSchedule } = require('../../controllers/qa_controllers/qa_exam_schedule_controllers');
const { allowRoles  } = require('../../middlewares/role_access_middleware')

router.post('/exam_schedule', allowRoles("admin"), storeExamSchedule);
router.post('/exam_schedule/cancel', allowRoles("admin"), cancelExamSchedule)
router.get('/exam_code_view', allowRoles("admin","staff"), viewExamCode);
//router.get('/exam_result',allowedRoles("admin") , )


module.exports = router;