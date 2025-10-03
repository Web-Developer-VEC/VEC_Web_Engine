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

  if (docs[0].collection_type === "coordinator"||docs[0].collection_type === "members"){
    const folder =`temp/static/images/iqac/dean_and_associates/`;
    s3Key = folder + realImagename;
    docs[0].meta_data.image_path = `/${s3Key}`; 
    
    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });
}

else if (docs[0].collection_type === "gallery") {
    const folder = `temp/static/images/iqac/gallery/`;
    const uploadedFiles = [];
     const s3Key = folder +realImagename;

    // check if fileStream is array (multiple files) or single
    const files = Array.isArray(fileStream) ? fileStream : [fileStream];

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

    const data = await s3.send(command);}

else if (docs[0].collection_type === "academic_admin_audit"){
let depts = {
  "B.E. Automobile Engineering": "002",
  "B.E. Civil Engineering": "004",
  "B.E. Computer Science & Engineering": "005",
  "B.E. Computer Science and Engineering (CYBER SECURITY)": "006",
  "B.E. Electronics and Communication Engineering": "009",
  "B.E. Electrical & Electronics Engineering": "007",
  "B.E. Electronics & Instrumentation Engineering": "008",
  "B.E. Mechanical Engineering": "013",
  "B.Tech. Artificial Intelligence and Data Science": "001",
  "B.Tech. Information Technology": "011"
};

let dept=docs[0].meta_data.department_name
let deptNo = null; 

if (depts.hasOwnProperty(dept)) {
  deptNo = depts[dept];
}
 const folder = `temp/static/pdfs/iqac/aaa/${deptNo}/`;
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
    if(docs[0].collection_type=="aqar"){
      const year=docs[0].meta_data.year
       s3Key =  `temp/static/pdfs/iqac/${year}.pdf`
    }
    else{
    s3Key = folder + realPdfname;}
    
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
