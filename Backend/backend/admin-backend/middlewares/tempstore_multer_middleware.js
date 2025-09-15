const multer = require("multer");
const path = require("path");
const multerS3 = require("multer-s3");
const { s3, bucketName } = require("../config/s3");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    key: (req, file, cb) => {
      let collectionName = "default";

      try {
        if (req.body && req.body.docs) {
          let docs = JSON.parse(req.body.docs);
          if (!Array.isArray(docs)) docs = [docs];
          if (docs[0]?.collectionName) {
            collectionName = docs[0].collectionName;
          }
        }
      } catch (err) {
        console.error("❌ Failed to parse docs in multer:", err);
      }

      // folder by type
      let folder = "";
      if (file.mimetype.startsWith("image/")) {
        folder = `temp/images/${collectionName}/`;
      } else if (file.mimetype === "application/pdf") {
        folder = `temp/pdfs/${collectionName}/`;
      } else {
        return cb(new Error("Only images and PDFs are allowed"), false);
      }

      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);

      cb(null, folder + uniqueName);
    },
  }),

  // ✅ Restrict file types
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"), false);
    }
  },
});

module.exports = upload;
