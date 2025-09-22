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
      if (!p) return null;

      const srcKey = p.replace(/^\//, "");
      if (srcKey.startsWith("temp/static/")) {
        const destKey = srcKey.replace(/^temp\/static\//, "static/");
        return await moveFile(srcKey, destKey);
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
    const oldValue =
      original[key] ||
      (Array.isArray(meta[key]) && meta[key].length > 0 ? meta[key] : null);

    if (!oldValue) continue;

    const paths = Array.isArray(oldValue) ? oldValue : [oldValue];

    await Promise.all(
      paths.map(async (p) => {
        if (!p) return null;

        const srcKey = p.replace(/^\//, "");
        if (srcKey.startsWith("static/")) {
          const destKey = srcKey.replace(/^static\//, "history/static/");
          await moveFile(srcKey, destKey);
        }
        return null;
      })
    );
  }

  // 2️⃣ Promote new temp files → static
  for (const [key, value] of Object.entries(meta)) {
    if (!value) continue;

    const paths = Array.isArray(value) ? value : [value];

    const updatedPaths = await Promise.all(
      paths.map(async (p) => {
        if (!p) return null;

        const srcKey = p.replace(/^\//, "");
        if (srcKey.startsWith("temp/static/")) {
          const destKey = srcKey.replace(/^temp\/static\//, "static/");
          return await moveFile(srcKey, destKey);
        }
        return p;
      })
    );

    // ✅ Save updated file paths back to meta
    meta[key] = Array.isArray(value)
      ? updatedPaths.filter(Boolean)
      : updatedPaths[0];
  }


  // 3️⃣ Save updated metadata
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



async function updateOriginalData(tempDoc, tempCollection) {
  const original = { ...(tempDoc.original_data || {}) };

  // 1️⃣ Move original_data files → history
  for (const [key, value] of Object.entries(original)) {
    if (!value) continue;

    const paths = Array.isArray(value) ? value : [value];

    const updatedPaths = await Promise.all(
      paths.map(async (p) => {
        if (!p) return null;

        const srcKey = p.replace(/^\//, "");
        if (srcKey.startsWith("static/")) {
          const destKey = srcKey.replace(/^static\//, "/history/static/");
          return destKey;
        }
        return p; // if not static, keep it unchanged
      })
    );

    // ✅ update original_data with history paths
    original[key] = Array.isArray(value)
      ? updatedPaths.filter(Boolean)
      : updatedPaths[0];
  }

  // 2️⃣ Save updated original_data
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
        if (!p) return null;

        const srcKey = p.replace(/^\//, "");
        if (srcKey.startsWith("static/")) {
          const destKey = srcKey.replace(/^static\//, "history/static/");
          return await moveFile(srcKey, destKey);
        }
        return p;
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
