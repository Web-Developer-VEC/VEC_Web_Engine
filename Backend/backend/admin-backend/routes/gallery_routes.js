const express = require("express");
const { handleTempAction } = require("../controllers/gallery_controllers");
const{handleTempApproval} = require("../middleware/approve_middleware");
const router = express.Router();

router.post("/:collectionName/dinesh", handleTempApproval, handleTempAction);


module.exports = router;
