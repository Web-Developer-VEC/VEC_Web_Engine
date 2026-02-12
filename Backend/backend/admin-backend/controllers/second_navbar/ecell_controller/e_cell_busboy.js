const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function ecellHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string" ? filename : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    // ✅ Allow only images and PDFs
    if (
      !(
        effectiveMime.startsWith("image/") ||
        effectiveMime === "application/pdf"
      )
    ) {
      fileStream.resume();
      return cb(new Error("Only images or PDFs are allowed"));
    }

    const meta_data = docs[0]?.meta_data;
    const collection_type = docs[0]?.collection_type;

    // Determine folder path based on file type
    let folder;
    if (effectiveMime.startsWith("image/")) {
      folder = `temp/static/images/e_cell/${realFilename}`;
    } else if (effectiveMime === "application/pdf") {
      folder = `temp/static/pdfs/e_cell/${meta_data.year}`;
    } else {
      fileStream.resume();
      return cb(new Error("Unsupported file type"));
    }

    const s3Key = `${folder}`;

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

    if (collection_type === "gallery") {
      const updateData = docs[0].meta_data.image_path;

      const imageArray = Array.isArray(updateData)
        ? [...updateData]
        : updateData
          ? [updateData]
          : [];

      imageArray.push(`/${s3Key}`);

      docs[0].meta_data = {
        ...(docs[0].meta_data || {}),
        image_path: imageArray,
      };
    }

    // Track uploaded files
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`, // You can convert to full URL if needed
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = ecellHandler;
