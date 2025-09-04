async function insertData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !category || !meta_data) {
      return res.status(400).json({ error: "collection_type, category, and filePaths are required" });
    }

    const filePaths = meta_data[filePaths];

    // 🔹 In mainCollection, field name is "type"
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
      return res.json({ message: "New type and category created successfully" });
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

    res.json({ message: "Image(s) inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = { insertData };