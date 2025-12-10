const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function transportHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";
    const effectiveMime = mimetype || filename?.mimeType || "application/pdf";

    console.log("Uploading file:", { realFilename, effectiveMime });

    if (effectiveMime !== "application/pdf") {
      fileStream.resume();
      return cb(new Error("Only PDFs are allowed"));
    }

    const collectionName = docs[0]?.collectionName || "transport";

    
    const folder = `temp/static/pdfs/${collectionName}/`;
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
      key: s3Key, // S3 key
      location: `/${s3Key}`, // or full URL if needed
      collection: collectionName,
      mimetype: effectiveMime,
    });

    console.log("✅ File uploaded to S3:", {
  key: s3Key,
  location: `/${s3Key}`,
  collection: collectionName,
  
});

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = transportHandler;
