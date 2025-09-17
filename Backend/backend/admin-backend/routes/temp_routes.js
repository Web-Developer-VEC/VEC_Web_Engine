const express = require("express");
const router = express.Router();

const authMiddleware = require('../middlewares/auth_middleware')
const storeTempMiddleware = require('../middlewares/tempstore_middleware');
const { checkRoleByCollection } = require("../middlewares/role_middleware");
const tempstoreBusboy = require("../middlewares/busboy_parser");



router.post(
    '/temp',
    authMiddleware,
    tempstoreBusboy,
    checkRoleByCollection(),  
    storeTempMiddleware
);

module.exports=router;
