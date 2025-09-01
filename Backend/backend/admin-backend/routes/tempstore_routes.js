const express = require('express');
const router = express.router();
const upload = require('../middleware/multer')
const authMiddleware = require('../middleware/auth_middleware');
const storeTempMiddleware = require('../middleware/tempstore_middleware');

router.post('/:collectionName/temp', authMiddleware, upload.array('files'),storeTempMiddleware);

module.exports=router;