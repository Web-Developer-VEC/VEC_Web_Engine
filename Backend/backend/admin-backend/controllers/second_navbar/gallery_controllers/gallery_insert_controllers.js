async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category, and filePaths are required");
  }

  const filePaths = meta_data.filePaths; // fixed: use key string not var

  const existingDoc = await mainCollection.findOne({ type: collection_type });

  if (!existingDoc) {
    // Create new document with type + category + images
    await mainCollection.insertOne({
      type: collection_type,
      data: [{
        category,
        image_path: Array.isArray(filePaths) ? filePaths : [filePaths]
      }]
    });
    return { created: true, message: "New type and category created" };
  }

  // 🔹 Find category inside existing data
  const categoryIndex = existingDoc.data.findIndex(c => c.category === category);

  if (categoryIndex === -1) {
    // New category inside same type
    existingDoc.data.push({
      category,
      image_path: Array.isArray(filePaths) ? filePaths : [filePaths]
    });
  } else {
    // Append new images without duplicates
    const existingImages = existingDoc.data[categoryIndex].image_path || [];
    const newImages = Array.isArray(filePaths) ? filePaths : [filePaths];
    existingDoc.data[categoryIndex].image_path = Array.from(new Set([...existingImages, ...newImages]));
  }

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );

  return { created: false, message: "Image(s) inserted successfully" };
}

module.exports = { insertData };
