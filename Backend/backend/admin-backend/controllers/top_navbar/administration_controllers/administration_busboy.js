const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function administrationHandler(fileStream, docs, req, cb, filename, mimetype) {
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
    if (collection_type === "principal") {
      mimeType = effectiveimageMime;
        ext = path.extname(realimagename) || ".jpg";
        type = "images";
        last =`principal_data/${ meta_data?.name}`;
        folder = `temp/static/${type}/${last}${ext}`;
    }
    else if (collection_type === "dean_and_association") {
      mimeType = effectiveimageMime;
            ext = path.extname(realimagename) || ".jpg";
            type = "images";
            last =`dean_and_associates/${ meta_data?.name}`;
            folder = `temp/static/${type}/${last}${ext}`;
    } 
    else if (collection_type === "admin_office") {
      mimeType = effectiveimageMime;
            ext = path.extname(realimagename) || ".jpg";
            type = "images";
            last =`admin_office/${ meta_data?.name}`;
            folder = `temp/static/${type}/${last}${ext}`;
    } 
    else if (collection_type === "committee") {
      mimeType = effectivepdfMime;
            ext = path.extname(realpdfname) || ".pdf";
            type = "pdfs";
            last =`committee/${ meta_data?.name}`;
            folder = `temp/static/${type}/${last}${ext}`;
    } 
    else if (collection_type === "HandBook") {
      mimeType = effectivepdfMime;
        ext = path.extname(realpdfname) || ".pdf";
        type = "pdfs"
        last = `handbook/${collection_type}-${meta_data.year}`;
        folder = `temp/static/${type}/${last}${ext}`;
    } 
    else if ( collection_type === "HRHandBook") {
      mimeType = effectivepdfMime;
        type = "pdfs";
        last = `HandBook/${realpdfname}`;
        folder = `temp/static/${type}/${last}`;
    } else if (collection_type === "organization_chart" ) {
      mimeType = effectiveimageMime;
        type = "images"
        last = `orgchart/${realimagename}`;
        folder = `temp/static/${type}/${last}`;
    } 
    else {
      return cb(new Error("Unsupported collection type"));
    }

    s3Key = folder;

    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    const data = await s3.send(command);

    if (collection_type === "principal") {
  docs[0].meta_data.image_path = `/${s3Key}`;
  }

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

module.exports = administrationHandler;
