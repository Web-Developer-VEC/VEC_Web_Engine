const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function aboutusHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {

    const realimagename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveimageMime =
      mimetype || filename?.mimeType || "image/jpeg";

  
    const realpdfname =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectivepdfMime =
      mimetype || filename?.mimeType || "application/pdf";

    const extname = path.extname(
      typeof filename === "string" ? filename : filename?.filename || ""
    ).toLowerCase();


    if (extname === ".pdf") {
      if (!effectivepdfMime.startsWith("application/pdf")) {
        fileStream.resume();
        return cb(new Error("Only PDFs are allowed"));
      }
    } else {
      if (!effectiveimageMime.startsWith("image/")) {
        fileStream.resume();
        return cb(new Error("Only images are allowed"));
      }
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

    let last, folder, s3Key, command, type, mimeType;
    let ext;
    if (collection_type === "about_vec") {
        const isPdf = path.extname(filename) === ".pdf";

    if (isPdf) {
      mimeType=effectivepdfMime,
        ext = ".pdf";
        type = "pdfs";
        last = `about_vec/${realpdfname}`;
    } else {
        mimeType=effectiveimageMime,
        ext = path.extname(realfilename) || ".jpg";
        type = "images";
        last = `about_vec/${realimagename}`;
    }
    }
    else if (collection_type === "Management" || collection_type === "about_trust") {
            mimeType=effectiveimageMime,
            ext = path.extname(realimagename) || ".jpg";
            type = "images";
            last =`trust/${realimagename}`;
    } 
    else if (collection_type === "vision_and_mission") {
            mimeType=effectiveimageMime,
            ext = path.extname(realimagename) || ".jpg";
            type = "images";
            last =`visionandmission/${realimagename}`;
    } 
    else if (collection_type === "AISHE") {
            mimeType=effectivepdfMime,
            ext = path.extname(realpdfname) || ".pdf";
            type = "pdfs";
            last =`about_vec/AISHE/${category}/AISHE ${category} ${meta_data.name}`;
    } 
    else {
      return cb(new Error("Unsupported collection type"));
    }

    folder = `temp/static/${type}/${last}${ext}`;
    s3Key = folder;

    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    const data = await s3.send(command);

    // Track uploaded files
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: command.input.ContentType,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = aboutusHandler;
