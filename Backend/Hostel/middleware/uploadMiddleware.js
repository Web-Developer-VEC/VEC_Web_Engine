const multer = require('multer');
const path = require('path');
const storagePaths = require('../config/storage');

// Configure storage dynamically based on file type
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath;

        console.log("📂 Received file fieldname:", file.fieldname); 

        if (file.fieldname === 'file') {
            uploadPath = storagePaths.studentDocs;
        } else if (file.fieldname === 'wardenImage') {
            uploadPath = storagePaths.wardenImages;
        } else if (file.fieldname === 'studentImage') {
            uploadPath = storagePaths.studentImages;
        } else {
            uploadPath = storagePaths.temp; // Default storage
        }

        console.log(`Uploading file to: ${uploadPath}`);

        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: fileStorage });

module.exports = upload;