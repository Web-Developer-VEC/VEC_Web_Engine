const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function academiccalendarHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realpdfname =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectivepdfMime =
      mimetype || filename?.mimeType || "application/pdf";

    if (!effectivepdfMime.startsWith("application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only PDFs are allowed"));
    }

    const collection_type = docs[0]?.collection_type;
    const meta_data = docs[0]?.meta_data;

    if (collection_type !== "academic_calendar") {
      return cb(new Error("Unsupported collection type"));
    }

    if (!meta_data?.year || !meta_data.year.startsWith("Academic Year")) {
      return cb(new Error("Invalid or missing year in meta_data"));
    }

    // Validate year format (e.g., "Academic Year YYYY-YYYY")
    const yearRegex = /^Academic Year \d{4}-\d{4}$/;
    if (!yearRegex.test(meta_data.year)) {
      return cb(new Error("Year must be in format 'Academic Year YYYY-YYYY'"));
    }

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const folder = `temp/static/pdfs/${meta_data.year}/${realpdfname}`;
    const s3Key = folder;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectivepdfMime,
    });

    const data = await s3.send(command);

    // Track uploaded files
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: command.input.ContentType,
    });

    cb(null, data);
  } catch (err) {
    console.error("Upload error:", err);
    cb(err);
  }
}

module.exports = academiccalendarHandler;