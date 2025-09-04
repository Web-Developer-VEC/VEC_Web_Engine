
async function deleteData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !category || !meta_data) {
      return res.status(400).json({ error: "collection_type, category, and filePaths are required" });
    }
    const filePaths = meta_data[image_path];

    const existingDoc = await mainCollection.findOne({ type: collection_type });
    if (!existingDoc) return res.status(404).json({ error: "Type not found" });

    const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Remove selected images
    const removeImages = Array.isArray(filePaths) ? filePaths : [filePaths];
    existingDoc.data[categoryIndex].image_path =
      (existingDoc.data[categoryIndex].image_path || []).filter(img => !removeImages.includes(img));

    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data: existingDoc.data } }
    );

    res.json({ message: "Image(s) deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = { deleteData };