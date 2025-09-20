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
      CopySource: `${bucketName}/${srcKey}`, // ✅ no leading slash
      Key: destKey,
    })
  );

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: srcKey,
    })
  );

  return `/${destKey}`; // return path to store in DB
}

/**
 * Insert: promote temp → static
 */
async function insertFile(tempDoc, tempCollection) {
  const meta = { ...(tempDoc.meta_data || {}) };

  for (const [key, value] of Object.entries(meta)) {
  if (!value) continue;

  const isArray = Array.isArray(value);
  const paths = isArray ? value : [value]; // make it an array for processing

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

  meta[key] = isArray ? updatedPaths : updatedPaths[0]; // restore string if original
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
async function updateFile(tempDoc, mainCollection) {
  const meta = { ...(tempDoc.meta_data || {}) };

  const existingDoc = await mainCollection.findOne({
    type: tempDoc.collection_type,
  });

  if (!existingDoc) {
    throw new Error("Document not found for update");
  }

  // 1️⃣ Move old files → history
  const oldMeta = existingDoc.meta_data || {};
  for (const [key, paths] of Object.entries(oldMeta)) {
    if (!Array.isArray(paths)) continue;

    oldMeta[key] = await Promise.all(
      paths.map(async (p) => {
        if (!p) return null;

        const srcKey = p.replace(/^\//, "");

        if (srcKey.startsWith("static/")) {
          const destKey = srcKey.replace(/^static\//, "history/static/");
          return await moveFile(srcKey, destKey);
        }

        return p; // already temp/history
      })
    );
  }

  // 2️⃣ Promote new temp files → static
  for (const [key, paths] of Object.entries(meta)) {
    if (!Array.isArray(paths)) continue;

    meta[key] = await Promise.all(
      paths.map(async (p) => {
        if (!p) return null;

        const srcKey = p.replace(/^\//, "");

        if (srcKey.startsWith("temp/")) {
          const destKey = srcKey.replace(/^temp\//, "static/");
          return await moveFile(srcKey, destKey);
        }

        return p; // already static/history
      })
    );
  }

  // 3️⃣ Prepare update data
  const updateFields = {
    type: tempDoc.collection_type,
    meta_data: meta,
    status: "active",
    updatedAt: new Date(),
  };

  // 4️⃣ Update DB
  await mainCollection.updateOne(
    { _id: existingDoc._id },
    { $set: updateFields }
  );

  return { updatedId: existingDoc._id, meta_data: meta };
}

/**
 * Delete: move files → history + mark deleted
 */
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
};
