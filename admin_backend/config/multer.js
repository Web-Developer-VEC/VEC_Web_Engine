const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BASE_UPLOAD_PATH, STATIC_PATHS } = require('./paths');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function setUploadDestinationKey(destinationKey) {
  return function (req, res, next) {
    req.destinationKey = destinationKey;
    next();
  };
}

function getMulterUploadFromRequest(fieldName = 'file') {
  return function (req, res, next) {
    const destinationKey = req.destinationKey;
    const relativePath = STATIC_PATHS[destinationKey];
    const absolutePath = path.join(BASE_UPLOAD_PATH, relativePath);

    if (!absolutePath.startsWith(BASE_UPLOAD_PATH)) {
      return next(new Error("Upload path traversal not allowed"));
    }

    ensureDirectoryExists(absolutePath);

    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, absolutePath),
      filename: (req, file, cb) => {
        const filename = req.filename || path.parse(file.originalname).name.replace(/[^a-z0-9_\-]/gi, '_');
        cb(null, `${filename}${path.extname(file.originalname)}`);
      }
    });

    multer({ storage }).single(fieldName)(req, res, next);
  };
}

module.exports = {
  setUploadDestinationKey,
  getMulterUploadFromRequest
};
