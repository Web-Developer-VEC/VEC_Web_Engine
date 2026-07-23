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
    const collectionType = String(doc?.collection_type || "").toLowerCase();
    const category = String(doc?.category || "").toLowerCase();
    const action = String(doc?.action || "").toLowerCase();

    const staffName = (doc?.meta_data?.members?.unique_id || "staff").toUpperCase().trim();

    if (!collectionName) {
      fileStream.resume();
      return cb(new Error("collectionName is missing"));
    }

    if (collectionType !== "faculty") {
      fileStream.resume();
      return cb(new Error("Invalid collection_type"));
    }

    const validCategories = [
      "head_of_department",
      "teaching_staff",
      "non_teaching_staff",
      "faculty_pdf_path",
    ];

    if (!validCategories.includes(category)) {
      fileStream.resume();
      return cb(new Error("Invalid category"));
    }

    if (!["insert", "update"].includes(action)) {
      fileStream.resume();
      return cb(new Error("Invalid action"));
    }

    if (category === "faculty_pdf_path" && !isPdf) {
      fileStream.resume();
      return cb(new Error("faculty_pdf_path accepts PDF only"));
    }

    const normalizedName = collectionName.toUpperCase().trim();
    const folderId = reverseDeptMap[normalizedName];

    if (!folderId) {
      fileStream.resume();
      console.error("Available collections:", Object.keys(reverseDeptMap));
      console.error("Received collectionName:", collectionName);

      return cb(
        new Error(
          `Invalid collectionName '${collectionName}'. Expected department name.`
        )
      );
    }

    let baseFolder;
    let finalFilename;
    
    let basefilename = doc.meta_data.members.unique_id.toUpperCase().trim();

    if (category === "faculty_pdf_path") {
      baseFolder = "static/pdfs/faculty_list/";

      finalFilename = path.basename(realFilename) || `${folderId}.pdf`;

      if (!path.extname(finalFilename)) {
        finalFilename += ".pdf";
      }
    } else {
      baseFolder = isPdf
        ? `static/pdfs/faculty_profile/${folderId}/`
        : `static/images/profile_photos/${folderId}/`;

      const ext = path.extname(realFilename)
        ? path.extname(realFilename).slice(1)
        : isPdf
          ? "pdf"
          : "jpg";

      const safeName = slugify(staffName);

      finalFilename = `${safeName.toUpperCase()}.${ext}`;
    }

    const s3Key = "temp/" + baseFolder + finalFilename;

    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }

    const fileBuffer = Buffer.concat(chunks);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);
    // Update meta_data with uploaded temp path
    if (doc?.meta_data?.members) {
      if (isPdf) {
        doc.meta_data.members.pdf_path = `/${s3Key}`;
      } else if (isImage) {
        doc.meta_data.members.image_path = `/${s3Key}`;
      }
    }
    if (!req.uploadedFiles) {
      req.uploadedFiles = [];
    }

    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveMime,
      collectionName,
      collectionType,
      category,
      action,
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