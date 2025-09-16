const Busboy = require("busboy");
const busboyModels = require("../models/busboymap_models");

function tempstoreBusboy(req, res, next) {
  if (
    req.method !== "POST" ||
    !req.headers["content-type"]?.includes("multipart/form-data")
  ) {
    return next();
  }

  const busboy = Busboy({ headers: req.headers });
  req.docsFromBusboy = [];
  req.uploadedFiles = [];

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

  handler(file, docs, req, (err) => {
    if (err) console.error("Handler error:", err.message);
  }, filename, mimetype);
});


  busboy.on("finish", () => {
    if (!req.docsFromBusboy.length) {
      return res.status(400).json({ error: "docs must be provided" });
    }
    next();
  });

  req.pipe(busboy);
}

module.exports = tempstoreBusboy;
