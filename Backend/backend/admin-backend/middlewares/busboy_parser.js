const Busboy = require("busboy");
const busboyModels = require("../models/busboymap_models");

function tempstoreBusboy(req, res, next) {
  
  if (
    req.method !== "POST" || !req.headers["content-type"]?.includes("multipart/form-data")
  ) {
    return next();
  }

  const busboy = Busboy({ headers: req.headers });
  req.docsFromBusboy = [];
  req.uploadedFiles = [];
  req._fileUploadPromises = [];

  busboy.on("field", (fieldname, val) => {
    if (fieldname === "docs") {
      try {
        const parsed = JSON.parse(val);
        req.docsFromBusboy = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON in docs" });
      }
    }
  });

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (fieldname !== "files") {
      file.resume();
      return;
    }

    const docs = req.docsFromBusboy || [];
    const collectionName = docs[0]?.collectionName || "default";
    const handler = busboyModels[collectionName] || busboyModels.default;

    // Wrap handler in a promise so we can wait for it
    const uploadPromise = new Promise((resolve, reject) => {
      handler(file, docs, req, (err) => {
        if (err) {
          console.error("Handler error:", err.message);
          reject(err);
        } else {
          console.log("✅ Handler finished. Uploaded files so far:", req.uploadedFiles);
          resolve();
        }
      }, filename, mimetype);
    });

    req._fileUploadPromises.push(uploadPromise);
  });

  busboy.on("finish", async () => {
    try {
      if (!req.docsFromBusboy.length) {
        return res.status(400).json({ error: "docs must be provided" });
      }

      // ✅ Wait for all uploads to finish
      await Promise.all(req._fileUploadPromises);

      console.log("🚀 All uploads completed. Files:", req.uploadedFiles);
      next();
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "File upload failed", details: err.message });
    }
  });

  req.pipe(busboy);
}


module.exports = tempstoreBusboy;
