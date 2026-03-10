async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }
  if (collection_type !== "activities") {
    throw new Error("Incorrect collection type or route");
  }

  if (collection_type === "activities") {
    // ✅ If meta_data is empty → delete whole category
    if (meta_data && Object.keys(meta_data).length === 0) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { category: category } } }
      );
      return { success:true, message: `Category ${category} deleted successfully` };
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc)
      throw new Error(
        `No document found for collection_type: ${collection_type}`
      );

    const categoryExist = doc.data.find((c) => c.category === category);
    if (!categoryExist) throw new Error(`Category ${category} does not exist`);

    const yearExist = categoryExist.content.find(
      (e) => e.year === meta_data.year
    );
    if (!yearExist)
      throw new Error(
        `Year ${meta_data.year} does not exist in category ${category}`
      );

    // ✅ Dynamically detect which field to delete from (e.g. activities_tile, events_list, pdfs, etc.)
    const arrayField = Object.keys(meta_data).find((key) => key !== "year");

    if (!arrayField) {
      throw new Error("No valid array field found in meta_data");
    }

    // ✅ Loop over the items to be deleted
    for (let item of meta_data[arrayField]) {
        const dynamicField = Object.keys(item)[0]; 
      const dynamicValue = item[dynamicField];

      await mainCollection.updateOne(
        { type: collection_type },
        {
          $pull: {
            [`data.$[d].content.$[c].${arrayField}`]: {
              [dynamicField]: dynamicValue,
            },
          },
        },
        {
          arrayFilters: [
            { "d.category": category },
            { "c.year": meta_data.year },
          ],
        }
      );
    }

    return {
      success:true, 
      message: `${arrayField} data deleted successfully for category ${category} and year ${meta_data.year}`,
    };
  }
}

module.exports = { deleteData };
