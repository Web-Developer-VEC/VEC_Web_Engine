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
  req._fileUploadPromises = [];

  busboy.on("field", (fieldname, val) => {
    if (fieldname === "docs") {
      try {
        const parsed = JSON.parse(val);
        req.docsFromBusboy = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        hasError = true;

        if (!res.headersSent) {
          res.status(400).json({
            error: "Invalid JSON format in docs",
          });
        }

        // 🔥 STOP BUSBOY COMPLETELY
        busboy.removeAllListeners();
        req.unpipe(busboy);
      }
    }
  });

  busboy.on("file", (fieldname, file, filename, mimetype) => {
    if (fieldname !== "files") {
      file.resume();
      return;
    }

    const docs = req.docsFromBusboy || [];
    const collectionName = docs[0]?.collectionName;
    const section = docs[0]?.collection_type; // since you said this holds type

    const handler =
      busboyModels[collectionName]?.[section] || busboyModels[collectionName];


    if (!handler) {
      file.resume();

      req._fileUploadPromises.push(
        Promise.resolve({
          success:false,
          error:`Handler not found. Collection is ${collectionName}`
        })
      )
      return
    }

    console.log("Handler check up", handler);
    

    // Wrap handler in a promise so we can wait for it
    const uploadPromise = new Promise((resolve) => {
      handler(
        file,
        docs,
        req,
        (err) => {
          if (err) {
            console.error("Handler error:", err.message);
            file.resume();
            resolve({
              success:false,error : err.message});
          } else {
            console.log(
              "✅ Handler finished. Uploaded files so far:",
              req.uploadedFiles,
            );
            resolve({success:true});
          }
        },
        filename,
        mimetype,
      );
    });

    req._fileUploadPromises.push(uploadPromise);
  });

  busboy.on("finish", async () => {
  try {
    if (!req.docsFromBusboy.length) {
      return res.status(400).json({ error: "docs must be provided" });
    }

    const results = await Promise.allSettled(req._fileUploadPromises);

    const failed = results.find      ((r) =>
        r.status === "fulfilled" &&
        r.value &&
        r.value.success === false
    );


    if (failed) {
      return res.status(400).json({
        error: failed.value.error
      });
    }

    console.log("🚀 All uploads completed. Files:", req.uploadedFiles);

    next();
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      error: "Unexpected upload failure",
      details: err.message,
    });
  }
});

  req.pipe(busboy);
}

module.exports = tempstoreBusboy;
