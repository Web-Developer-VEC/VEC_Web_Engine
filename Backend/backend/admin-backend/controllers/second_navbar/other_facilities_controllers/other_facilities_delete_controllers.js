async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category) {
    throw new Error("collection_type and category are required");
  }

  const existingDoc = await mainCollection.findOne({ type: collection_type });
  if (!existingDoc) {
    return { deleted: false, message: "Type does not exist" };
  }

  const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
  if (categoryIndex === -1) {
    return { deleted: false, message: "Category not found" };
  }

  // If meta_data empty → delete whole category
  if (!meta_data || Object.keys(meta_data).length === 0) {
    existingDoc.data.splice(categoryIndex, 1);
  } else {
    // Otherwise, match on name/description/image_path
    const cat = existingDoc.data[categoryIndex];

    if (meta_data.name && cat.name === meta_data.name) cat.name = null;
    if (meta_data.description && cat.description === meta_data.description) cat.description = null;

    if (meta_data.image_path && cat.image_path) {
      cat.image_path = cat.image_path.filter(img => img !== meta_data.image_path);
    }
  }

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );

  return { deleted: true, message: "Data deleted successfully" };
}

module.exports = { deleteData };
