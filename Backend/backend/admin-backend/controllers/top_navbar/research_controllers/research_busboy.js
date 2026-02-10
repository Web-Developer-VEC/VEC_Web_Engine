const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function researchHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {

    const realpdfname =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectivepdfMime =
      mimetype || filename?.mimeType || "application/pdf";

    if (!effectivepdfMime.startsWith("application/pdf")) {
        fileStream.resume();
        return cb(new Error("Only PDFs are allowed"));
      }


    const collection_type = docs[0]?.collection_type;
    const meta_data = docs[0]?.meta_data;

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    let last, folder, s3Key, command;
    const ext = path.extname(realpdfname) || ".pdf";

    if (collection_type === "Journal Publication") {
      last =`overall_research/${meta_data?.year}/${ meta_data?.year} - Journal Publication`;
    } else if (collection_type === "Funded Projects") {
      last = `Projects/${meta_data.year}`;
    } else if (collection_type === "Consultancy") {
      last = `Consultancy/${meta_data.year}`;
    } else if(collection_type === "Books and Book chapters"){

        last =`overall_research/${ meta_data?.year}/${ meta_data?.year} Books & Book chapters`;
    }else if(collection_type === "Policy"){

        last =`overall_research/${ meta_data?.name}`;
    }
    else {
      return cb(new Error("Unsupported collection type"));
    }

    folder = `temp/static/pdfs/${last}${ext}`;
    s3Key = folder;

    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectivepdfMime,
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

module.exports = researchHandler;
