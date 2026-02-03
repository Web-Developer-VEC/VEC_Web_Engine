const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

async function placementHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    // ---------- BASIC SAFETY ----------
    if (!docs || !docs.length) {
      throw new Error("No document metadata received");
    }

    if (!fileStream) {
      throw new Error("No file stream received");
    }

    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    console.log("Uploading placement file:", {
      realFilename,
      effectiveMime,
    });

    // ---------- FILE TYPE VALIDATION ----------
    if (
      !(
        effectiveMime.startsWith("image/") ||
        effectiveMime === "application/pdf"
      )
    ) {
      fileStream.resume();
      return cb(new Error("Only images or PDFs are allowed"));
    }

    const doc = docs[0];
    const collection_type = doc.collection_type;

    let s3Key;
    let ext = path.extname(realFilename);

    // ---------- PLACEMENT TEAM ----------
    if (collection_type === "placement_team") {
      const name = doc.meta_data?.name;
      if (!name) {
        throw new Error("Placement team name missing");
      }

      ext = ext || ".jpg";
      s3Key = `temp/static/images/placement_members/${name}${ext}`;
    }

    // ---------- ALUMNI ----------
    else if (collection_type === "alumini") {
      ext = ext || ".jpg";
      s3Key = `temp/static/images/placement_members/${realFilename}`;
    }

    // ---------- PLACEMENT DETAILS (PDF UPLOAD) ----------
    else if (collection_type === "placement_details") {
      const meta_data = doc.meta_data;

      // 🔒 Strict validation
      if (
        meta_data?.section !== "year_wise_pdfs" ||
        !meta_data?.year
      ) {
        throw new Error(
          "Invalid payload for placement_details PDF upload"
        );
      }

      // Clean year (remove * if present)
      const year = meta_data.year.replace(/\*/g, "");
      ext = ext || ".pdf";

      s3Key = `temp/static/pdfs/placement_docs/placements_${year}${ext}`;

      // ✅ Normalize meta_data into DB-ready structure
      doc.meta_data = {
        year_wise_pdfs: [
          {
            year: meta_data.year,
            pdf_path: `/${s3Key}`,
          },
        ],
      };
    }

    // ---------- UNKNOWN COLLECTION ----------
    else {
      throw new Error(`Unsupported collection type: ${collection_type}`);
    }

    // ---------- BUFFER FILE ----------
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }

    if (!chunks.length) {
      throw new Error("Uploaded file is empty");
    }

    const fileBuffer = Buffer.concat(chunks);

    // ---------- UPLOAD TO S3 ----------
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);

    // ---------- TRACK UPLOAD ----------
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    console.error("Placement upload error:", err.message);
    cb(err);
  }
}

module.exports = placementHandler;
