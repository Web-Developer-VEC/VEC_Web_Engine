const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Always upload first into a temp folder
    const uploadPath = path.join(__dirname, "../public/temp");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Keep original name (we’ll rename in backend)
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;