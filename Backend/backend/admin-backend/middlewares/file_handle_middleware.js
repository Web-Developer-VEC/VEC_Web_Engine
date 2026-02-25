// file_handle_middleware.js
const { s3, bucketName } = require("../config/s3");
const {
  CopyObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

/**
 * Move file inside S3 (copy + delete).
 */
async function moveFile(srcKey, destKey) {
  console.log("📦 Moving:", { srcKey, destKey });

  await s3.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${srcKey}`, 
      Key: destKey,
    })
  );

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: srcKey,
    })
  );

  return `/${destKey}`; 
}


function normalizeKey(key) {
  if (!key || typeof key !== "string") return key;

  try {
    if (key.startsWith("http")) {
      const url = new URL(key);
      key = url.pathname;
    }

    key = key.replace(/^\/+/, "");
    key = key.replace(/\\/g, "/");

    try {
      key = decodeURIComponent(key);
    } catch {}

    key = key.normalize("NFC");
    key = key.replace(/\u00A0/g, " ");
    key = key.replace(/\/{2,}/g, "/");

    return key.trim();
  } catch (err) {
    console.error("Key normalization failed:", err);
    return key;
  }
}


/**
 * Insert: promote temp → static
 */
async function insertFile(tempDoc, tempCollection) {
  const meta = { ...(tempDoc.meta_data || {}) };

  for (const [key, value] of Object.entries(meta)) {
  if (!value) continue;

  const isArray = Array.isArray(value);
  const paths = isArray ? value : [value]; 

  const updatedPaths = await Promise.all(
    paths.map(async (p) => {
      if (p === "") return "";
      if (p === null || p === undefined) return null;
        // case 1: p is a string
        if (typeof p === "string") {
          const srcKey = p.replace(/^\//, "");
          if (srcKey.startsWith("temp/static/")) {
            const destKey = srcKey.replace(/^temp\/static\//, "static/");
            await moveFile(srcKey, destKey);
            return `/${destKey}`;
          }
          return p;
        }

        // case 2: p is an object with pdf_path
        if (typeof p === "object" && p.pdf_path) {
          let pathStr = p.pdf_path.replace(/^\//, "");
          if (pathStr.startsWith("temp/static/")) {
            const destKey = pathStr.replace(/^temp\/static\//, "static/");
            await moveFile(pathStr, destKey);
            return { ...p, pdf_path: `/${destKey}` };
          }
          return p;
        }
        return p;
    })
  );

  meta[key] = isArray ? updatedPaths : updatedPaths[0]; 
}


   await tempCollection.updateOne(
    { _id: tempDoc._id },
    { $set: { meta_data: meta, updatedAt: new Date() } }
  );

  return { tempId: tempDoc._id, meta_data: meta };
}

/**
 * Update: move old → history, new temp → static
 */
async function updateFile(tempDoc, tempCollection) {
  const meta = { ...(tempDoc.meta_data || {}) };
  const original = { ...(tempDoc.original_data || {}) };

  // 1️⃣ Move old files → history
  for (const key of new Set([...Object.keys(meta), ...Object.keys(original)])) {
    let oldValue =
      original[key] ||
      (Array.isArray(meta[key]) && meta[key].length > 0 ? meta[key] : null);

    if (!oldValue) continue;

    const isArray = Array.isArray(oldValue);
    const paths = isArray ? oldValue : [oldValue];

    const updatedPaths = await Promise.all(
      paths.map(async (p) => {
        if (p === "") return "";
        if (p === null || p === undefined) return null;

        // case 1: p is a string
        if (typeof p === "string") {
          const srcKey = await normalizeKey(p.replace(/^\//, ""));
          if (srcKey.startsWith("static/")) {
            const destKey = srcKey.replace(/^static\//, "history/static/");
            await moveFile(srcKey, destKey);
            console.log("Hari String",destKey)
            return  `/${destKey}`;
          }
          return p;
        }

        // case 2: p is an object with pdf_path
        if (typeof p === "object" && p.pdf_path) {
          let pathStr = await normalizeKey(p.pdf_path.replace(/^\//, ""));
          if (pathStr.startsWith("static/")) {
            const destKey = pathStr.replace(/^static\//, "history/static/");
            await moveFile(pathStr, destKey);
            console.log("Hari Object",destKey)
            return { ...p, pdf_path:  `/${destKey}` };
          }
          return p;
        }

        return p || "";
      })
    );

    const finalValue = isArray ? updatedPaths : updatedPaths[0];
    original[key] = finalValue; // update original_data with history paths
  }

  // 2️⃣ Promote new temp files → static
  for (const [key, value] of Object.entries(meta)) {
    if (key !== "pdf_path" && key !== "image_path") continue;
    if (!value) continue;
   

    const isArray = Array.isArray(value);
    const paths = isArray ? value : [value];

    const updatedPaths = await Promise.all(
      paths.map(async (p) => {
        if (p === "") return "";
        if (p === null || p === undefined) return null;

        // case 1: p is a string
        if (typeof p === "string") {
          const srcKey = await normalizeKey(p.replace(/^\//, ""));
          if (srcKey.startsWith("temp/static/")) {
            const destKey = srcKey.replace(/^temp\/static\//, "static/");
            await moveFile(srcKey, destKey);
            return  `/${destKey}`;
          }
          return p;
        }

        // case 2: p is an object with pdf_path
        if (typeof p === "object" && p.pdf_path) {
          let pathStr = await normalizeKey(p.pdf_path.replace(/^\//, ""));
          if (pathStr.startsWith("temp/static/")) {
            const destKey = pathStr.replace(/^temp\/static\//, "static/");
            await moveFile(pathStr, destKey);
            return { ...p, pdf_path: `/${destKey}`};
          }
          return p;
        }

        return p || "";
      })
    );

    meta[key] = isArray ? updatedPaths : updatedPaths[0];
    
    if (
      tempDoc.collection_type === "academic_calendar" &&
      key === "pdf_path"
    ) {

      const originalPaths = tempDoc.original_data?.pdf_path || ["", ""];
      const currentPaths = meta[key] || [];

      meta[key] = [
        currentPaths[0] !== undefined ? currentPaths[0] : originalPaths[0] || "",
        currentPaths[1] !== undefined ? currentPaths[1] : originalPaths[1] || ""
      ];
    }
  }

  // 3️⃣ Save updated metadata & original_data
  await tempCollection.updateOne(
    { _id: tempDoc._id },
    {
      $set: {
        meta_data: meta,
        original_data: original,
        updatedAt: new Date(),
      },
    }
  );

  return { tempId: tempDoc._id, meta_data: meta, original_data: original };
}


async function updateOriginalData(tempDoc, tempCollection) {
  const original = { ...(tempDoc.original_data || {}) };

  // Move original_data files → history
  for (const [key, value] of Object.entries(original)) {
    if (!value) continue;

    const isArray = Array.isArray(value);
    const paths = isArray ? value : [value];

    const updatedPaths = await Promise.all(
      paths.map(async (p) => {
        if (!p) return null;

        // case 1: p is a string
        if (typeof p === "string") {
          const srcKey = await normalizeKey(p.replace(/^\//, ""));
          if (srcKey.startsWith("static/")) {
            const destKey = srcKey.replace(/^static\//, "history/static/");
            return `/${destKey}`;
          }
          return p;
        }

        // case 2: p is an object with pdf_path
        if (typeof p === "object" && p.pdf_path) {
          let pathStr = await normalizeKey(p.pdf_path.replace(/^\//, ""));
          if (pathStr.startsWith("static/")) {
            const destKey = pathStr.replace(/^static\//, "history/static/");
            return { ...p, pdf_path: `/${destKey}` };
          }
          return p;
        }

        return p;
      })
    );

    original[key] = isArray ? updatedPaths.filter(Boolean) : updatedPaths[0];
  }

  await tempCollection.updateOne(
    { _id: tempDoc._id },
    {
      $set: {
        original_data: original,
        updatedAt: new Date(),
      },
    }
  );

  return { tempId: tempDoc._id, original_data: original };
}




async function deleteFile(tempDoc, tempCollection) {
 
  const meta = { ...(tempDoc.meta_data || {}) };
  const original = { ...(tempDoc.original_data || {}) };

  for (const key of new Set([...Object.keys(meta), ...Object.keys(original)])) {
    let currentValue = meta[key] && (
      (Array.isArray(meta[key]) && meta[key].length > 0) ||
      (typeof meta[key] === "string" && meta[key].trim() !== "")
    )
      ? meta[key]
      : original[key];

    if (!currentValue) continue;

    const isArray = Array.isArray(currentValue);
    const paths = isArray ? currentValue : [currentValue];

    const updatedPaths = await Promise.all(
  paths.map(async (p) => {
    if (p === "") return "";
    if (p === null || p === undefined) return null;

    // case 1: p is a string
    if (typeof p === "string") {

      const srcKey =  await normalizeKey(p.replace(/^\//, ""));
   
      if (srcKey.startsWith("static/")) {

        const destKey = srcKey.replace(/^static\//, "history/static/");
        
        return await moveFile(srcKey, destKey);
      }
      return p;
    }

    // case 2: p is an object with pdf_path
    if (typeof p === "object" && p.pdf_path) {
      let pathStr = p.pdf_path.replace(/^\//, "");
       pathStr = await normalizeKey(pathStr);
      if (pathStr.startsWith("static/")) {
        const destKey = pathStr.replace(/^static\//, "history/static/");
        const moved = await moveFile(pathStr, destKey);
        return { ...p, pdf_path: moved }; // keep the object structure
      }
      return p;
    }

    return p; // fallback
  })
);


    const finalValue = isArray ? updatedPaths : updatedPaths[0];
    meta[key] = finalValue;
    original[key] = finalValue; 
  }

  await tempCollection.updateOne(
    { _id: tempDoc._id },
    {
      $set: {
        meta_data: meta,
        updatedAt: new Date(),
      },
    }
  );

  return { tempId: tempDoc._id, meta_data: meta };
}



module.exports = {
  insertFile,
  updateFile,
  deleteFile,
  updateOriginalData
};
