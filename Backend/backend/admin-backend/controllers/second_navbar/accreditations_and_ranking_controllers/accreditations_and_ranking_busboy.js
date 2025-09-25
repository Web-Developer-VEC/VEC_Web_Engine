const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function accreditations_and_rankingHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
   const realFilename =
  typeof filename === "string"
    ? filename
    : filename?.filename || "file";

const effectiveMime = mimetype || filename?.mimeType || "application/octet-stream";

console.log("Uploading accreditations and ranking file:", { realFilename, effectiveMime });

// ✅ Allow only images and PDFs
if (!(effectiveMime.startsWith("image/") || effectiveMime === "application/pdf")) {
  fileStream.resume();
  return cb(new Error("Only images or PDFs are allowed"));
}


    const collection_type = docs[0]?.collection_type || "accreditations_and_ranking";
    const category = docs[0]?.category;

    // Helper to extract SSR code like "ssr_1.pdf"
    function extractSSRCode(name) {
      const match = name.match(/Cycle\s+(\d+)\s+SSR/i);
      return match ? `ssr_${match[1]}.pdf` : null;
    }

    // Define S3 key
    let s3Key;
    if (!req.fileIndex) req.fileIndex = 0;

    if (collection_type === "naac") {
      if (category === "Self Study Reports") {
        const nameFromDocs = docs[0].meta_data.name;
        const ssrName = extractSSRCode(nameFromDocs); // e.g. "ssr_1.pdf"

        if (!ssrName) {
          return cb(new Error("Invalid SSR name format"));
        }

        s3Key = `temp/static/pdfs/${collection_type}/${ssrName}`;
      }

      if (category === "Certificates") {
        const certName = docs[0].meta_data.name; // e.g. "certificate1"
        s3Key = `temp/static/pdfs/${collection_type}/${certName}.pdf`;
      }
    }
  if (collection_type === "nba") {  
      const { department, pdfs } = docs[0].meta_data;
      const pdf = pdfs[req.fileIndex]; // pick nth entry
      if (!pdf) return cb(new Error("Too many files uploaded for NBA"));
      const year = pdf.name;
      s3Key = `temp/static/pdfs/${collection_type}/${department}_${year}.pdf`;
      pdf.pdf_path = `/${s3Key}`;
    }
 if (collection_type === "nirf") {
  const meta_data = docs[0].meta_data;
  const content = meta_data?.content || [];

  if (!req.fileIndex) req.fileIndex = 0;
  const pdf = content[req.fileIndex];
  req.fileIndex++;
  if (!pdf) return cb(new Error("Too many files uploaded for NIRF"));

  const name = pdf.name;
  s3Key = `temp/static/pdfs/${collection_type}/${category}-${name}.pdf`;

  // replace only this pdf’s path
  pdf.pdf_path = `/${s3Key}`;
     const { pdf_path, ...restMeta } = meta_data;
  docs[0].meta_data = restMeta;
}

if(collection_type=="qs_rating"){
  s3Key = `/static/pdfs/qs+rating/${realFilename}`;
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
      location: `/${s3Key}`, // ⚠️ replace with full S3 URL if needed
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = accreditations_and_rankingHandler;
