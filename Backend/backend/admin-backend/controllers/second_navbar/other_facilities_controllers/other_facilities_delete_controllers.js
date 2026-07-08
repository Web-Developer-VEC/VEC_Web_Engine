async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    const existingDoc = await mainCollection.findOne({ type: collection_type });

    const categoryIndex = existingDoc.data.findIndex(
      (c) => c.category === category
    );

    if (categoryIndex === -1) {
      return { success: false, message: "Category not found" };
    }

    const cat = existingDoc.data[categoryIndex];

    // SPECIAL CASE: Seminar Halls
    if (category === "Seminar Halls") {

      const index = cat.name.findIndex(
        (n) => n === meta_data.name
      );

      if (index === -1) {
        return { success: false, message: "Hall not found" };
      }

      cat.name.splice(index, 1);
      cat.description.splice(index, 1);
      cat.image_path.splice(index, 1);

    } else {

      // Normal categories
      if (meta_data.name && cat.name === meta_data.name) {
        cat.name = null;
      }

      if (meta_data.description && cat.description === meta_data.description) {
        cat.description = null;
      }

      if (meta_data.image_path && cat.image_path) {

         const images = Array.isArray(cat.image_path)
    ? cat.image_path
    : [cat.image_path];

  const removeImages = Array.isArray(meta_data.image_path)
    ? meta_data.image_path
    : [meta_data.image_path];

  cat.image_path = images.filter(img => !removeImages.includes(img));
      }
    }

    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data: existingDoc.data } }
    );

    return { success: true, message: "Data deleted successfully" };

  } catch (error) {
    return { success: false, error: error.message };
  }
}
module.exports = { deleteData };
