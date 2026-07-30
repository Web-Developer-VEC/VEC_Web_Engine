const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function otherFacilitiesHandler(
    fileStream,
    docs,
    req,
    cb,
    filename,
    mimetype
) {
    try {
        const realFilename =
            typeof filename === "string"
                ? filename
                : filename?.filename || "image.webp";

        const effectiveMime =
            mimetype || filename?.mimeType || "image/webp";

        console.log("Uploading other_facilities file:", {
            realFilename,
            effectiveMime,
        });

        // Allow only images
        if (!effectiveMime.startsWith("image/")) {
            fileStream.resume();
            return cb(new Error("Only images are allowed"));
        }

        // Get category
        const category = docs[0]?.category;

        if (!category) {
            fileStream.resume();
            return cb(
                new Error("Category is required for other_facilities upload")
            );
        }

        // S3 path
        const folder = `temp/static/images/other_facilities/${category}/`;
        const s3Key = folder + realFilename;

        // Read stream
        const chunks = [];
        for await (const chunk of fileStream) {
            chunks.push(chunk);
        }

        const fileBuffer = Buffer.concat(chunks);

        // Upload
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: effectiveMime,
        });

        const data = await s3.send(command);

        // Store uploaded file details
        if (!req.uploadedFiles) {
            req.uploadedFiles = [];
        }

        req.uploadedFiles.push({
            key: s3Key,
            location: `/${s3Key}`,
            mimetype: effectiveMime,
            category,
        });

        console.log("✅ Upload successful:", s3Key);

        cb(null, data);
    } catch (err) {
        console.error("❌ Upload error:", err);
        cb(err);
    }
}

module.exports = otherFacilitiesHandler;