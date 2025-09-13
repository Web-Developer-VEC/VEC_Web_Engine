const express = require("express");
const router = express.Router();

const authMiddleware = require('../middlewares/auth_middleware')
const {getTempRequests} = require('../middlewares/temprequest_middleware')
const upload = require('../middlewares/tempstore_multer_middleware')
const storeTempMiddleware = require('../middlewares/tempstore_middleware');
const { checkRoleByCollection } = require("../middlewares/role_middleware");


router.post('/temp',authMiddleware,upload.array('files'),checkRoleByCollection(),storeTempMiddleware);

router.get('/request',getTempRequests);

module.exports=router;
