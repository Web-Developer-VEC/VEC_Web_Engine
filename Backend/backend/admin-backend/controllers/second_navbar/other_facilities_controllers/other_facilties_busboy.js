const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function otherFacilitiesHandler(fileStream, docs, req, cb, filename, mimetype) {
    try {
        const realFilename =
            typeof filename === "string"
                ? filename
                : filename?.filename || "image.webp";

        const effectiveMime = mimetype || filename?.mimeType || "image/webp";

        console.log("Uploading other_facilities file:", { realFilename, effectiveMime });

        // ✅ Allow only image formats
        if (!effectiveMime.startsWith("image/")) {
            fileStream.resume();
            return cb(new Error("Only images are allowed"));
        }

        // Get category from the document
        const category = docs[0]?.category;
        if (!category) {
            fileStream.resume();
            return cb(new Error("Category is required for other_facilities upload"));
        }

        // ✅ Construct S3 path: other_facilities/{category}/{filename}
        const folder = `temp/static/images/other_facilities/${category}/`;
        const s3Key = folder + realFilename;

        // Buffer the stream
        const chunks = [];
        for await (const chunk of fileStream) {
            chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks);

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: effectiveMime,
        });

        const data = await s3.send(command);

        // Track uploaded files
        if (!req.uploadedFiles) req.uploadedFiles = [];
        req.uploadedFiles.push({
            key: s3Key,
            location: `/${s3Key}`, // This will be: /temp/static/images/other_facilities/{category}/{filename}
            mimetype: effectiveMime,
            category: category, // Store category for reference
        });

        console.log("✅ Upload successful:", s3Key);

        cb(null, data);
    } catch (err) {
        console.error("❌ Upload error:", err);
        cb(err);
    }
}

module.exports = otherFacilitiesHandler;