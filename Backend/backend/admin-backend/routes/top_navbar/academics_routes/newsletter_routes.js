const express = require('express');

const router = express.Router();

const {handleTempAction} = require('../../../middlewares/action_handle_middleware');

const {handleTempApproval} = require('../../../middlewares/approve_middleware');

const {insertData} = require('../../../controllers/top_navbar/academics_controllers/newsletter_controllers/newsletter_insert_controllers');
const { deleteData } = require('../../../controllers/top_navbar/academics_controllers/newsletter_controllers/newsletter_delete_controllers');
const { updateData } = require('../../../controllers/top_navbar/academics_controllers/newsletter_controllers/newsletter_update_controllers');
const { checkRole } = require('../../../middlewares/role_middleware');


router.post(
    '/newsletteradmin',
     checkRole(["super_admin"]),
     handleTempApproval,
     handleTempAction(insertData, updateData, deleteData)
    );



module.exports = router;