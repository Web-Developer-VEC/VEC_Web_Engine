const express = require("express");
const { handleTempAction } = require("../controllers/gallery_controllers");

const{handleTempApproval} = require("../middlewares/approve_middleware");
const router = express.Router();

router.post("/gallery/galleryadmin", handleTempApproval, handleTempAction);



module.exports = router;
