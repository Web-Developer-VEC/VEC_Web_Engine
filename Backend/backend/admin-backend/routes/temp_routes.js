const express = require("express");
const router = express.Router();

const {getTempCompleted,getTempRequests} = require('../middlewares/approve_middleware') ;
const authMiddleware = require('../middlewares/auth_middleware')
const upload = require('../middlewares/multer')
const storeTempMiddleware = require('../middlewares/tempstore_middleware');


router.get('/:collectionName/completed',getTempCompleted);


router.post('/:collectionName/temp',authMiddleware,upload.array('files'),storeTempMiddleware);


router.get('/request',getTempRequests);

module.exports=router;
