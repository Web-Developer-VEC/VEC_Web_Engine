const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function aboutusHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realpdfname =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectivepdfMime =
      mimetype || filename?.mimeType || "application/pdf";

    // ✅ Allow only PDFs
    if (!effectivepdfMime.startsWith("application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only PDFs are allowed"));
    }

    const collection_type = docs[0]?.collection_type;
    const meta_data = docs[0]?.meta_data;
    const category = docs[0]?.category;

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    let ext = path.extname(realpdfname) || ".pdf";
    let last, folder, s3Key;

    // ---------- ABOUT VEC (UNCHANGED) ----------
    if (collection_type === "about_vec") {
      last = `about_vec/${meta_data.name}`;
    }

    // ---------- AISHE (FIXED) ----------
    else if (collection_type === "AISHE") {
      if (!category || !meta_data?.name) {
        return cb(new Error("AISHE category and name are required"));
      }

      last = `about_vec/AISHE/${category}/AISHE ${category} ${meta_data.name}`;
    }

    else {
      return cb(new Error("Unsupported collection type"));
    }

    folder = `temp/static/pdfs/${last}${ext}`;
    s3Key = folder;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectivepdfMime,
    });

    const data = await s3.send(command);

    // ---------- 🔥 IMPORTANT FIX FOR AISHE ----------
    if (collection_type === "AISHE") {
      // Inject temp pdf path so insert/update works
      meta_data.pdf_path = `/${s3Key}`;
    }

    // Track uploaded files (unchanged)
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectivepdfMime,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = aboutusHandler;
