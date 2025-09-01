const express = require("express");
const router = express.Router();
const {getTempCompleted,getTempRequests} = require('../middleware/approve_middleware') ;
const authMiddleware = require('../middleware/auth_middleware')
const upload = require('../middleware/multer')
const storeTempMiddleware = require('../middleware/tempstore_middleware');

router.get('/:collectionName/completed',getTempCompleted);


router.post('/:collectionName/temp',authMiddleware,upload.array('files'),storeTempMiddleware);



router.get('/request',getTempRequests);

module.exports=router;
