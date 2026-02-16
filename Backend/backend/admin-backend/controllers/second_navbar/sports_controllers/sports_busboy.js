const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require('path')

async function sportsHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveMime = mimetype || filename?.mimeType || "image/jpeg";
    let s3Key
    // ✅ Allow only image formats
    if (!effectiveMime.startsWith("image/")) {
      fileStream.resume();
      return cb(new Error("Only images are allowed"));
    }

    const collection_type = docs[0]?.collection_type || "sports";
    const meta_data = docs[0]?.meta_data;
    
    const ext = path.extname(realFilename) || ".jpg";
   
    if(collection_type=== "hod" || collection_type=== "faculty" ){
      console.log("dinesh",meta_data.title);
    const folder = `temp/static/images/sports/${collection_type}/`;
    s3Key = folder + meta_data.name + ext;
    }
    else if(collection_type=== "infrastructure" || collection_type=== "intramural"){
    const folder = `temp/static/images/sports/${collection_type}/`;
    
    s3Key = folder + meta_data.title + ext;
    
    }
    else if(collection_type==="achivements"){
    const folder = `temp/static/images/sports/coordinates/`;
    s3Key = folder + realFilename;

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

module.exports = sportsHandler;
