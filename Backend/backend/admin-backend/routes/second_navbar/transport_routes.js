const express = require("express");
const uploadPdf = require("../../middleware/multer/pdfUpload");
const { uploadTransportPdf } = require("../../controllers/second_navbar/transport_controller");
const router = express.Router();

// PDF upload + update
router.post("/transport", uploadPdf.single("pdf"), uploadTransportPdf);

module.exports = router;