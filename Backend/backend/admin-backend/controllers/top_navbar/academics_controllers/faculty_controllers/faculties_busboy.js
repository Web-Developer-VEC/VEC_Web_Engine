const path = require("path");
const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const facultydeptMap = require("../../../../models/faculty_map");

const reverseDeptMap = Object.fromEntries(
  Object.entries(facultydeptMap).map(([k, v]) => [v.toUpperCase().trim(), k])
);

function slugify(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function facultyHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string" ? filename : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    const isImage = effectiveMime.startsWith("image/");
    const isPdf = effectiveMime === "application/pdf";

    if (!isImage && !isPdf) {
      fileStream.resume();
      return cb(new Error("Only images and PDFs are allowed"));
    }

    const doc = docs?.[0];
    const collectionName = doc?.collectionName || doc?.collection_name;
    const collectionType = String(doc?.collection_type || "").toUpperCase();
    const staffName = doc?.meta_data?.name || "staff";

    if (!collectionName) {
      fileStream.resume();
      return cb(new Error("collectionName is missing"));
    }

    if (
      !["HOD", "FACULTY", "NON_TEACHING_FACULTY", "FACULTY_PDF_PATH"].includes(
        collectionType
      )
    ) {
      fileStream.resume();
      return cb(new Error("Invalid collection_type"));
    }

    if (collectionType === "FACULTY_PDF_PATH" && !isPdf) {
      fileStream.resume();
      return cb(new Error("FACULTY_PDF_PATH accepts PDF only"));
    }

    const normalizedName = collectionName.toUpperCase().trim();
    const folderId = reverseDeptMap[normalizedName];

    if (!folderId) {
      fileStream.resume();
      console.error("Available collections:", Object.keys(reverseDeptMap));
      console.error("Received collectionName:", collectionName);
      return cb(
        new Error(
          `Invalid collectionName '${collectionName}'. Expected format: DEPT_XXX_staff (e.g., AIDS_001_staff)`
        )
      );
    }

    let baseFolder;
    let finalFilename;

    if (collectionType === "FACULTY_PDF_PATH") {
      baseFolder = "static/pdfs/faculty_list/";
      finalFilename = path.basename(realFilename) || `${folderId}.pdf`;
      if (!path.extname(finalFilename)) {
        finalFilename = `${finalFilename}.pdf`;
      }
    } else {
      baseFolder = isPdf
        ? `static/pdfs/${collectionType.toLowerCase()}/${folderId}/`
        : `static/images/profile_photos/${folderId}/`;

      const ext = realFilename.includes(".")
        ? realFilename.split(".").pop()
        : isPdf
        ? "pdf"
        : "jpg";

      const safeName = slugify(staffName) || "staff";
      finalFilename = `${safeName}.${ext}`;
    }

    const s3Key = baseFolder + finalFilename;

    const chunks = [];
    for await (const chunk of fileStream) chunks.push(chunk);
    const fileBuffer = Buffer.concat(chunks);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);

    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveMime,
      collectionType,
      collectionName,
      department: folderId,
      departmentName: facultydeptMap[folderId],
      staffName,
    });

    console.log(`Uploaded: ${s3Key}`);

    cb(null, data);
  } catch (err) {
    console.error("Faculty upload error:", err);
    cb(err);
  }
}

module.exports = facultyHandler;
