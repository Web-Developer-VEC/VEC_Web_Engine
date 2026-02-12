const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

async function hostelHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    // 🔹 Resolve filename
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveMime =
      mimetype || filename?.mimeType || "image/jpeg";

    console.log("Uploading file:", { realFilename, effectiveMime });

    // ✅ Allow only images or PDFs
    if (
      !effectiveMime.startsWith("image/") &&
      effectiveMime !== "application/pdf"
    ) {
      fileStream.resume();
      return cb(new Error("Only images or PDFs are allowed"));
    }

    const doc = docs?.[0] || {};
    const collection_type = doc.collection_type;
    const meta_data = doc.meta_data || {};

    const ext = path.extname(realFilename) || "";
    let s3Key = realFilename;

    // 📁 S3 path logic
    if (collection_type === "about") {
      s3Key = `temp/static/images/hostel/${realFilename}`;
    }

    else if (collection_type === "hostel_facilities") {
      const title = (meta_data.title || "facility")
        .toLowerCase()
        .replace(/\s+/g, "_");

      s3Key = `temp/static/images/hostel/${title}${ext}`;
    }

    else if (collection_type === "warden") {
      const name = (meta_data.warden_name || "warden")
        .toLowerCase()
        .replace(/\s+/g, "_");

      s3Key = `temp/static/images/warden_profile_photos/${name}${ext}`;
    }

    // 🔹 Buffer stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // ☁️ Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);

    // 🧾 Track uploaded files
    if (!req.uploadedFiles) req.uploadedFiles = [];

    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`, // or full S3 URL if required
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    console.error("Hostel Upload Error:", err);
    cb(err);
  }
}

module.exports = hostelHandler;
