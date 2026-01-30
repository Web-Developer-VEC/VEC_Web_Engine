const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

async function placementHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveMime = mimetype || filename?.mimeType || "image/jpeg";

    console.log("Uploading incubation facilities images:", { realFilename, effectiveMime });

    // ✅ Allow only image formats
    if (!(effectiveMime.startsWith("image/") || effectiveMime === "application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only images or PDFs are allowed"));
    }

    const collection_type = docs[0]?.collection_type;
    let s3Key 
    let ext;

    if (collection_type === "placement_team") {
      const name = docs[0].meta_data.name;
      ext = path.extname(realFilename)||".jpg";
      const folder = `temp/static/images/placement_members/${name}${ext}`;
      s3Key = folder;
    }
    if (collection_type === "alumini") {
      ext = path.extname(realFilename)||".jpg";
      const folder = `temp/static/images/placement_members/${realFilename}`;
      s3Key = folder;
    }

    if (collection_type === "placement_details") {
        const meta_data=docs[0].meta_data;
      const year = docs[0].meta_data.year_wise_pdfs[0].year;
      ext = path.extname(realFilename)||".pdf";
      const folder = `temp/static/pdfs/placement_docs/placements_${year}${ext}`;
      s3Key = folder;
     docs[0].meta_data.year_wise_pdfs[0].pdf_path = `/${s3Key}`;
     const { pdf_path, ...restMeta } = meta_data;
  docs[0].meta_data = restMeta;
    }

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
      location: `/${s3Key}`, // replace with full S3 URL if needed
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = placementHandler;
