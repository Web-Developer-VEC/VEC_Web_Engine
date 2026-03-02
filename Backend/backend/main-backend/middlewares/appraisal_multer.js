const multer = require("multer");
const { PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const path = require("path");
const logError = require("./logerror");


// ==============================
// CONFIG
// ==============================

const bucketName = process.env.AWS_BUCKET_NAME;

const baseUrl =
    `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com`;


// ==============================
// MULTER CONFIG
// ==============================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 20 * 1024 * 1024, // 5MB
        files: 20
    },

    fileFilter: (req, file, cb) => {

        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF allowed"), false);
        }
    }

}).any();


// ==============================
// DEEP SETTER FUNCTION
// ==============================

const setDeepValue = (obj, pathString, value) => {

    const keys = pathString.split(".");
    let temp = obj;

    keys.forEach((key, index) => {

        if (index === keys.length - 1) {

            temp[key] = value;

        }
        else {

            if (!temp[key])
                temp[key] = {};

            temp = temp[key];
        }

    });

};


// ==============================
// ERROR HANDLER
// ==============================

const handleUploadError = async (req, res, err) => {

    let status = 500;
    let message = "Internal server error";
    console.log(err);

    if (err?.code === "LIMIT_FILE_SIZE") {

        status = 400;
        message = "File too large. Max size is 5MB";

    }
    else if (err?.message === "Only PDF allowed") {

        status = 400;
        message = "Only PDF files are allowed";

    }

    await logError(req, err, "Error in appraisal upload middleware", status);

    return res.status(status).json({
        error: message
    });

};


// ==============================
// MAIN UPLOAD MIDDLEWARE
// ==============================

const s3UploadMiddleware = (req, res, next) => {

    upload(req, res, async (err) => {

        if (err)
            return handleUploadError(req, res, err);

        try {

            // ======================
            // CHECK DATA EXISTS
            // ======================

            if (!req.body?.data) {

                return res.status(400).json({
                    message: "Missing data payload"
                });

            }


            // ======================
            // PARSE JSON
            // ======================

            let parsedData;

            try {

                parsedData = JSON.parse(req.body.data);

            }
            catch {

                return res.status(400).json({
                    message: "Invalid data payload"
                });

            }


            // ======================
            // VALIDATION
            // ======================

            if (!parsedData.department || !parsedData.academic_year) {

                return res.status(400).json({
                    message: "Department & Academic Year required"
                });

            }

            const dept = parsedData.department.toUpperCase();
            const year = parsedData.academic_year;


            const allowedDepts = [

                "AIDS",
                "AUTO",
                "CHEMISTRY",
                "CIVIL",
                "CSE",
                "CSECS",
                "EEE",
                "EIE",
                "ECE",
                "ENGLISH",
                "IT",
                "MATHS",
                "MECH",
                "TAMIL",
                "PHYSICS",
                "MECSE",
                "MBA",

            ];


            if (!allowedDepts.includes(dept)) {

                return res.status(400).json({
                    message: "Invalid department"
                });

            }


            // ======================
            // FILE UPLOAD
            // ======================

            if (req.files && req.files.length > 0) {

                for (const file of req.files) {

                    // Safe filename
                    const baseName = path
                        .parse(file.originalname)
                        .name
                        .replace(/[^a-zA-Z0-9]/g, "_");


                    const fileKey =
                        `static/pdfs/appraisal/proof/${dept}/${year}/${baseName}.pdf`;

                    if (!file.buffer || file.buffer.length < 1000) {

                        return res.status(400).json({
                            message: `Invalid or corrupted PDF file: ${file.originalname}`
                        });

                    }
                    // Upload to S3
                    await s3.send(

                        new PutObjectCommand({

                            Bucket: bucketName,

                            Key: fileKey,

                            Body: file.buffer,

                            ContentType: "application/pdf"

                        })

                    );


                    const fileUrl =
                        `${baseUrl}/${fileKey}`;


                    // Save into JSON
                    setDeepValue(
                        parsedData,
                        file.fieldname,
                        fileUrl
                    );

                }

            }


            req.processedData = parsedData;

            next();


        }
        catch (error) {

            await logError(
                req,
                error,
                "Error in appraisal upload middleware",
                500
            );

            return res.status(500).json({
                error: "Internal server error"
            });

        }

    });

};


// ==============================
// UPLOAD REPORT PDF
// ==============================

const uploadAppraisalReport = async (buffer, filePath) => {

    const key =
        `static/pdfs/appraisal/reports/${filePath}`;

    const params = {

        Bucket: bucketName,

        Key: key,

        Body: buffer,

        ContentType: "application/pdf"

    };


    await s3.send(
        new PutObjectCommand(params)
    );


    return `${baseUrl}/${key}`;

};



// ==============================
// CHECK IF FILE EXISTS
// ==============================

const CheckIfFileExists = async (filePath) => {

    const key =
        `static/pdfs/appraisal/reports/${filePath}`;
    try {

        await s3.send(

            new HeadObjectCommand({

                Bucket: bucketName,

                Key: key

            })

        );


        return {

            exists: true,

            url: `${baseUrl}/${key}`

        };

    }
    catch (err) {


        // File not found
        if (err.$metadata?.httpStatusCode === 404) {

            return { exists: false };

        }

        console.log("S3 Error:", err);

        return { exists: false };

    }

};


// ==============================
// EXPORT
// ==============================

module.exports = {

    s3UploadMiddleware,
    uploadAppraisalReport,
    CheckIfFileExists

};