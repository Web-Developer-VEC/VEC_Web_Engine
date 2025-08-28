const express = require("express");
const uploadPdf = require("../middleware/pdfUpload");
const { uploadTransportPdf } = require("../controllers/transport_controller");
const router = express.Router();

// PDF upload + update
router.post("/transport", uploadPdf.single("pdf"), uploadTransportPdf);

module.exports = router;