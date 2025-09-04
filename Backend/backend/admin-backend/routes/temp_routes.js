const express = require("express");
const router = express.Router();

const {handleTempApproval} = require('../middlewares/approve_middleware') ;
const authMiddleware = require('../middlewares/auth_middleware')
const {getTempRequests} = require('../middlewares/temprequest_middleware')
const upload = require('../middlewares/multer')
const storeTempMiddleware = require('../middlewares/tempstore_middleware');

router.get('/:collectionName/completed',handleTempApproval);

router.post('/:collectionName/temp',authMiddleware,upload.array('files'),storeTempMiddleware);

router.get('/request',getTempRequests);

module.exports=router;
