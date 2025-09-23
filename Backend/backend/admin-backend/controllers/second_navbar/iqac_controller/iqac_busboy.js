const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function iqacHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realImagename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg" ;
    const realPdfname =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectiveMime = mimetype || filename?.mimeType || "image/jpeg" ;
    const pdfMime = mimetype || filename?.mimeType || "application/pdf" ;   
   
let command
let s3Key
 
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    console.log("Hari",docs)

  if (docs[0].collection_type === "coordinator"){
    const folder = `temp/static/images/profile_photos/`;
    s3Key = folder + realImagename;
    
    
    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });
}
else if(docs[0].collection_type === "gallery"){
    const folder = `temp/static/images/iqac/`;
    s3Key = folder + realImagename;

    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

}
  

else if (docs[0].collection_type === "academic_admin_audit"){
    const folder = `temp/static/pdfs/iqac/aaa/`;
    s3Key = folder + realPdfname;

    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: pdfMime,
    });
}

else  if (docs[0].collection_type === "minutes_of_meetings" || "strategic_plan" || "best_practices" || "institutional_distinctiveness" || "code_of_ethics" || "aqar" || "iso_certificate"){
    const folder = `temp/static/pdfs/iqac/`;
    s3Key = folder + realPdfname;
    
    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: pdfMime,
    });
}
     
         const data = await s3.send(command);

    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push(
        {
      key: s3Key,
      location: `/${s3Key}`, 
      mimetype: command.input.ContentType,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = iqacHandler;
