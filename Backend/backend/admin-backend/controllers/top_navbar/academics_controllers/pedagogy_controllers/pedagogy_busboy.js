const path = require("path");
const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");

// Build reverse map once
const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v.toUpperCase().trim(), k])
);

function sanitizeBaseName(value, fallback = "file") {
  const raw = String(value || fallback).trim();
  const noExt = path.parse(raw).name;
  return (noExt || fallback)
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeYear(year) {
  if (typeof year !== "string") return "";
  return year.replace(/\s*-\s*/g, "-").trim();
}

async function pedagogyHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const doc = docs?.[0] || {};

    const realFilename =
      typeof filename === "string" ? filename : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    const isPdf = effectiveMime.startsWith("application/pdf");

    if (!isPdf) {
      fileStream.resume();
      return cb(new Error("Only PDFs are allowed"));
    }

    if (doc.collection_type && doc.collection_type !== "pedagogy") {
      return cb(new Error("Unsupported collection type"));
    }

    const category = doc.category;
    const collectionName = doc.collectionName || doc.collection_name;

    if (!collectionName) {
      return cb(new Error("collectionName is missing"));
    }

    const normalizedName = collectionName.toUpperCase().trim();
    const folderId = reverseDeptMap[normalizedName];

    if (!folderId) {
      return cb(new Error(`Invalid collectionName '${collectionName}'`));
    }

    const year = normalizeYear(doc.meta_data?.year);
    if (!year) {
      return cb(new Error("meta_data.year is required for pedagogy PDFs"));
    }

    const contentName = doc.meta_data?.content?.[0]?.name;
    const baseName = sanitizeBaseName(contentName || realFilename, "pedagogy");
    const pdfFileName = `${baseName}.pdf`;

    const s3Key = `temp/static/pdfs/Pedagogy/${folderId}/${year}/${pdfFileName}`;

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

    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveMime,
      category,
      department: folderId,
      collectionName,
      year: doc.meta_data?.year,
    });

    // Keep nested payload shape in temp docs for pedagogy records.
    if (doc.meta_data?.content?.[0]) {
      doc.meta_data.content[0].pdf_path = `/${s3Key}`;
    }

    cb(null, data);
  } catch (err) {
    console.error("Pedagogy upload error:", err);
    cb(err);
  }
}

module.exports = pedagogyHandler;
