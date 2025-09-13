const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Custom storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const collectionName = req.params.collectionName; // dynamic collection name from route

    let folder = "";
    if (file.mimetype.startsWith("image/")) {
      folder = `temp/static/images/${collectionName}`;
    } else if (file.mimetype === "application/pdf") {
      folder = `temp/static/pdfs/${collectionName}`;
    } else {
      return cb(new Error("Only images and PDFs are allowed"), false);
    }

    // ✅ Ensure folder exists
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter only images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
