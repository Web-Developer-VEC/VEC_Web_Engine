async function updateData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data, original_data } = tempDoc;

  if (!collection_type || !category || !meta_data || !original_data) {
    throw new Error("collection_type, category, original_data and meta_data are required");
  }

  if (collection_type === "activities") {
    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error(`No document found for collection_type: ${collection_type}`);

    const categoryExist = doc.data.find((c) => c.category === category);
    if (!categoryExist) throw new Error(`Category ${category} does not exist`);

    const yearExist = categoryExist.content.find((e) => e.year === meta_data.year);
    if (!yearExist) throw new Error(`Year ${meta_data.year} does not exist in category ${category}`);

    // ✅ Dynamically detect the array field (excluding "year")
    const arrayField = Object.keys(meta_data).find((key) => key !== "year");
    if (!arrayField) throw new Error("No valid array field found in meta_data");

    // ✅ Iterate over each item in the detected arrayField
    for (let i = 0; i < meta_data[arrayField].length; i++) {
      const newItem = meta_data[arrayField][i];
      const originalItem = original_data[arrayField]?.[i];

      if (!originalItem) continue; // skip if no corresponding original item

      await mainCollection.updateOne(
        { type: collection_type },
        {
          $set: {
            [`data.$[d].content.$[c].${arrayField}.$[r]`]: newItem
          }
        },
        {
          arrayFilters: [
            { "d.category": category },
            { "c.year": meta_data.year },
            { "r.name": originalItem.name } // match by original name
          ]
        }
      );
    }

    return { message: `${arrayField} data updated successfully for category ${category} and year ${meta_data.year}` };
  }
}

module.exports = { updateData };
