async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category, and filePaths are required");
  }

  const filePaths = meta_data.image_path; // fixed: correct key

  const existingDoc = await mainCollection.findOne({ type: collection_type });
  if (!existingDoc) throw new Error("Type not found");

  const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  // Remove selected images
  const removeImages = Array.isArray(filePaths) ? filePaths : [filePaths];
  existingDoc.data[categoryIndex].image_path =
    (existingDoc.data[categoryIndex].image_path || []).filter(img => !removeImages.includes(img));

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );

  return { message: "Image(s) deleted successfully" };
}

module.exports = { deleteData };
