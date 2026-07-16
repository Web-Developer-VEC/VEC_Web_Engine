const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const path = require("path");
const logError = require("./logerror");

const bucketName = process.env.AWS_BUCKET_NAME;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF allowed"), false);
        }
    },
}).any();

// Deep setter
const setDeepValue = (obj, pathString, value) => {
    const keys = pathString.split(".");
    let temp = obj;

    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            temp[key] = value;
        } else {
            if (!temp[key]) temp[key] = {};
            temp = temp[key];
        }
    });
};

const handleUploadError = async (req, res, err) => {
    let status = 500;
    let message = "Internal server error";

    if (err?.code === "LIMIT_FILE_SIZE") {
        status = 400;
        message = "File too large. Max size is 5MB";
    } else if (err?.message === "Only PDF allowed") {
        status = 400;
        message = "Only PDF files are allowed";
    }

    await logError(req, err, "Error in appraisal upload middleware", status);
    return res.status(status).json({ error: message });
};

const s3UploadMiddleware = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) return handleUploadError(req, res, err);

        try {

            if (!req.body?.data) {
                return res.status(400).json({
                    message: "Missing data payload"
                });
            }

            let parsedData;
            try {
                parsedData = JSON.parse(req.body.data);
            } catch (parseErr) {
                return res.status(400).json({
                    message: "Invalid data payload"
                });
            }

            const dept = parsedData.department;
            const year = parsedData.academic_year;

            const allowedDepts = [
                "cse",
                "ece",
                "it",
                "mech",
                "civil",
                "ai_ds"
            ];

            if (!allowedDepts.includes(dept)) {
                return res.status(400).json({
                    message: "Invalid department"
                });
            }

            if (!dept || !year) {
                return res.status(400).json({
                    message: "Department & Academic Year required"
                });
            }

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {

                    const baseName = path.parse(file.originalname).name
                        .replace(/\s+/g, "_");
                    console.log(baseName);

                    const fileKey =
                        `static/pdfs/appraisal/${dept}/${year}/${baseName}.pdf`;
                    console.log(fileKey);

                    await s3.send(new PutObjectCommand({
                        Bucket: bucketName,
                        Key: fileKey,
                        Body: file.buffer,
                        ContentType: file.mimetype
                    }));

                    // fieldname example:
                    // student_admission_details.sanctioned_strength.pdf_path
                    setDeepValue(parsedData, file.fieldname, fileKey);
                }
            }

            req.processedData = parsedData;
            next();

        } catch (error) {
            await logError(req, error, "Error in appraisal upload middleware", 500);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};

module.exports = s3UploadMiddleware;
