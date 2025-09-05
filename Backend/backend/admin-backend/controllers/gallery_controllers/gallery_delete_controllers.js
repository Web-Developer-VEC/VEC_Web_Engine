async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category) {
    throw new Error("collection_type and category are required");
  }

  const existingDoc = await mainCollection.findOne({ type: collection_type });
  if (!existingDoc) throw new Error("Type not found");

  const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  // ✅ Case 1: If meta_data is missing, null, or empty object → delete category
  if (
    !meta_data ||
    (typeof meta_data === "object" && Object.keys(meta_data).length === 0)
  ) {
    existingDoc.data.splice(categoryIndex, 1);
  } else {
    // ✅ Case 2: Remove only selected images (if any provided)
    const filePaths = meta_data.image_path;
    if (filePaths) {
      const removeImages = Array.isArray(filePaths) ? filePaths : [filePaths];
      existingDoc.data[categoryIndex].image_path =
        (existingDoc.data[categoryIndex].image_path || []).filter(
          img => !removeImages.includes(img)
        );
    }
  }

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );

  return {
    message:
      !meta_data || (typeof meta_data === "object" && Object.keys(meta_data).length === 0)
        ? "Category deleted successfully"
        : "Image(s) deleted successfully"
  };
}

module.exports = { deleteData };
