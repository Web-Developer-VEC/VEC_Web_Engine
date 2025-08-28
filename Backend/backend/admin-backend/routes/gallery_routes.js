const express = require("express");
const { insertData, deleteData } = require("../controllers/gallery_controllers");
const router = express.Router();
const upload = require('../middleware/uploads');

router.post("/gallery/insert", upload.array("files"), insertData);
router.delete("/gallery/delete", deleteData);

module.exports = router;
