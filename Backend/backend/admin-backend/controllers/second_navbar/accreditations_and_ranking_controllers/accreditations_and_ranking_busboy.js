const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function accreditations_and_rankingHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectiveMime = mimetype || filename?.mimeType || "application/octet-stream";

    console.log("Uploading accreditations and ranking file:", { realFilename, effectiveMime });

    // ✅ Allow only images and PDFs
    if (!(effectiveMime.startsWith("image/") || effectiveMime === "application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only images or PDFs are allowed"));
    }

    const collection_type = docs[0]?.collection_type || "accreditations_and_ranking";
    const category = docs[0]?.category || "General";
    const meta_data = docs[0]?.meta_data || {};

    // Build S3 key path dynamically
    let s3Key;
    if (!req.fileIndex) req.fileIndex = 0;

    switch (collection_type) {
      case "naac":
        if (category === "Self Study Reports" || category === "Certificates") {
          s3Key = `temp/static/pdfs/naac/${realFilename}`;
        } else {
          s3Key = `temp/static/pdfs/naac/others/${realFilename}`;
        }
        break;

      case "nba":
        const { department, pdfs } = meta_data;
        const pdfNBA = pdfs?.[req.fileIndex];
        if (!pdfNBA) return cb(new Error("Too many files uploaded for NBA"));

        const year = pdfNBA.name;
        s3Key = `temp/static/pdfs/nba/${realFilename}`;
        pdfNBA.pdf_path = `/${s3Key}`;
        break;

      case "nirf":
        const content = meta_data.content || [];
        const pdfNIRF = content[req.fileIndex];
        req.fileIndex++;

        if (!pdfNIRF) return cb(new Error("Too many files uploaded for NIRF"));

        const nameNIRF = pdfNIRF.name;
        s3Key = `temp/static/pdfs/nirf/${realFilename}`;
        pdfNIRF.pdf_path = `/${s3Key}`;
        const { pdf_path, ...restMeta } = meta_data;
        docs[0].meta_data = restMeta;
        break;

      case "qs_rating":
        s3Key = `temp/static/pdfs/qs rating/${realFilename}`;
        break;

      default:
        // Generic fallback
        s3Key = `temp/static/pdfs/${collection_type}/${category}/${realFilename}`;
        break;
    }

    // Buffer the file stream
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
      location: `/${s3Key}`,
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = accreditations_and_rankingHandler;
