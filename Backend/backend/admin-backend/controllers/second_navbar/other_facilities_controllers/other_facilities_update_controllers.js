async function updateData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category, and meta_data are required");
  }

  const filePaths = meta_data.image_path
    ? (Array.isArray(meta_data.image_path) ? meta_data.image_path : [meta_data.image_path])
    : [];

  const name = meta_data.name || "";
  const description = meta_data.description || "";

  const existingDoc = await mainCollection.findOne({ type: collection_type });
  if (!existingDoc) {
    return { updated: false, message: "Type does not exist" };
  }

  const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
  if (categoryIndex === -1) {
    return { updated: false, message: "Category not found" };
  }

  // Replace values with new ones
  existingDoc.data[categoryIndex] = {
    category,
    name,
    description,
    image_path: filePaths
  };

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );

  return { updated: true, message: "Data updated successfully" };
}

module.exports = { updateData };
