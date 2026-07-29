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

    // Allow only PDFs
    if (!effectivepdfMime.startsWith("application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only PDFs are allowed"));
    }

    const doc = docs?.[0];
    if (!doc) {
      return cb(new Error("Document not found"));
    }

    const collection_type = doc.collection_type;
    const meta_data = doc.meta_data;
    const category = doc.category;
    const isUpdate = doc.action === "update";

    if (!meta_data) {
      return cb(new Error("meta_data missing"));
    }

    // Buffer file stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }

    const fileBuffer = Buffer.concat(chunks);
    const ext = path.extname(realpdfname) || ".pdf";

    let s3Key;

    // =====================================================
    // TYPE 1: ABOUT_VEC or AISHE with single file
    // meta_data: { name, pdf_path }
    // =====================================================

    if (meta_data.name && typeof meta_data.pdf_path === "string") {

      // Only process if frontend says file exists
      const uploadBase = path.basename(realpdfname);

if (isUpdate && meta_data.pdf_path) {
    const frontendBase = path.basename(meta_data.pdf_path);

    if (frontendBase !== uploadBase) {
        return cb(
            new Error(
                `Filename mismatch. Expected "${frontendBase}" got "${uploadBase}"`
            )
        );
    }
}

      if (collection_type === "about_vec") {

        s3Key =
          `temp/static/pdfs/about_vec/${meta_data.name}${ext}`;
      }

      else if (collection_type === "AISHE") {

        if (!category) {
          return cb(new Error("AISHE category required"));
        }

        s3Key = `temp/static/pdfs/about_vec/AISHE/${category}/${realpdfname}`;
      }

      else {
        return cb(new Error("Unsupported collection type"));
      }

      // overwrite with final S3 path
      meta_data.pdf_path = `/${s3Key}`;
    }


    // =====================================================
    // TYPE 2: AISHE multiple files
    // meta_data: { category, content: [{ name, pdf_path }] }
    // =====================================================

    else if (
      collection_type === "AISHE" &&
      meta_data.category &&
      Array.isArray(meta_data.content)
    ) {

      const uploadBase = path.basename(realpdfname);

      const targetContent = meta_data.content.find(item =>
        item.pdf_path &&
        path.basename(item.pdf_path) === uploadBase
      );

      if (!targetContent) {
        return cb(
          new Error(
            `Uploaded file "${uploadBase}" not found in meta_data.content`
          )
        );
      }

      s3Key =
        `temp/static/pdfs/about_vec/AISHE/${meta_data.category}/` +
        `AISHE ${meta_data.category} ${targetContent.name}${ext}`;

      // overwrite frontend temp path
      targetContent.pdf_path = `/${s3Key}`;
    }


    // =====================================================
    // INVALID STRUCTURE
    // =====================================================

    else {
      return cb(
        new Error("Invalid meta_data structure")
      );
    }


    // =====================================================
    // Upload to S3
    // =====================================================

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectivepdfMime,
    });

    const data = await s3.send(command);


    // =====================================================
    // Track uploaded files
    // =====================================================

    if (!req.uploadedFiles) {
      req.uploadedFiles = [];
    }

    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectivepdfMime,
    });


    // =====================================================
    // Return success
    // =====================================================

    cb(null, data);

  }

  catch (err) {
    cb(err);
  }
}

module.exports = aboutusHandler;
