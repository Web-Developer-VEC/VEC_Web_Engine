const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function iqacHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const doc = docs[0];

    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const contentType =
      mimetype || filename?.mimeType || "application/octet-stream";

    let command;
    let s3Key;

    /* -----------------------------------------
       READ STREAM ONLY ONCE
    ----------------------------------------- */
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    /* -----------------------------------------
       COORDINATOR / MEMBERS (IMAGES)
    ----------------------------------------- */
    if (doc.collection_type === "coordinator" || doc.collection_type === "members") {
      const folder = "temp/static/images/iqac/dean_and_associates/";
      s3Key = folder + realFilename;

      doc.meta_data = doc.meta_data || {};
      doc.meta_data.image_path = `/${s3Key}`;

      command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
      });
    }

    /* -----------------------------------------
       GALLERY (IMAGES)
    ----------------------------------------- */
    else if (doc.collection_type === "gallery") {
      const folder = "temp/static/images/iqac/gallery/";
      s3Key = folder + realFilename;

      doc.meta_data = doc.meta_data || {};
      doc.meta_data.image_path = doc.meta_data.image_path || [];
      doc.meta_data.image_path.push(`/${s3Key}`);

      command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
      });
    }

    /* -----------------------------------------
       ACADEMIC ADMIN AUDIT (PDF)
    ----------------------------------------- */
    else if (doc.collection_type === "academic_admin_audit") {
      const depts = {
        "B.E. Automobile Engineering": "002",
        "B.E. Civil Engineering": "004",
        "B.E. Computer Science & Engineering": "005",
        "B.E. Computer Science and Engineering (CYBER SECURITY)": "006",
        "B.E. Electronics and Communication Engineering": "009",
        "B.E. Electrical & Electronics Engineering": "007",
        "B.E. Electronics & Instrumentation Engineering": "008",
        "B.E. Mechanical Engineering": "013",
        "B.Tech. Artificial Intelligence and Data Science": "001",
        "B.Tech. Information Technology": "011",
      };

      const dept = doc.meta_data?.department_name;
      const deptNo = depts[dept];

      if (!deptNo) {
        throw new Error(`Invalid department: ${dept}`);
      }

      const folder = `temp/static/pdfs/iqac/aaa/${deptNo}/`;
      s3Key = folder + realFilename;

      doc.meta_data.pdf_path = [`/${s3Key}`];

      command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: "application/pdf",
      });
    }

    /* -----------------------------------------
       OTHER PDF TYPES
    ----------------------------------------- */
    else if (
      [
        "minutes_of_meetings",
        "strategic_plan",
        "best_practices",
        "institutional_distinctiveness",
        "code_of_ethics",
        "aqar",
        "iso_certificate",
      ].includes(doc.collection_type)
    ) {
      const folder = "temp/static/pdfs/iqac/";

      if (doc.collection_type === "aqar" && doc.meta_data?.year) {
        s3Key = `${folder}${doc.meta_data.year}.pdf`;
      } else {
        s3Key = folder + realFilename;
      }

      doc.meta_data.pdf_path = `/${s3Key}`;

      command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: "application/pdf",
      });
    }

    /* -----------------------------------------
       SAFETY CHECK
    ----------------------------------------- */
    if (!command) {
      throw new Error(`S3 command not initialized for ${doc.collection_type}`);
    }

    /* -----------------------------------------
       UPLOAD TO S3
    ----------------------------------------- */
    const data = await s3.send(command);

    /* -----------------------------------------
       TRACK UPLOADED FILE
    ----------------------------------------- */
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: command.input.ContentType,
    });

    cb(null, data);
  } catch (err) {
    console.error("IQAC Upload Error:", err);
    cb(err);
  }
}

module.exports = iqacHandler;
