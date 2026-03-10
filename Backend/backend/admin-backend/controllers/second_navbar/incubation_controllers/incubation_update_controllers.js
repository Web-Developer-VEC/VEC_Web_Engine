async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data, category } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error(
        "collection_type, meta_data, and original_data are required"
      );
    }

    const singleObject = ["home"];
    const multipleObject = [
      "start_up",
      "incubation_committee",
      "facilities",
      "patent",
      "seed_money",
    ];

    const categoryObjects = ["projects"];

    if (categoryObjects.includes(collection_type)) {
      if (!category) {
        throw new Error("category ir required");
      }

      const doc = await mainCollection.findOne({ type: collection_type });

      const categoryExist = doc.data.find((c) => c.category === category);

      if (categoryExist) {
        const keys = Object.keys(original_data);

        const updateQuery = {};
        keys.forEach((key) => {
          updateQuery[`data.$[elem].content.$[con].${key}`] = meta_data[key];
        });
        
        const conFilter = {};

        keys.forEach((key) => {
          conFilter[`con.${key}`] = original_data[key];
        });

        await mainCollection.updateOne(
          { type: collection_type },
          { $set: updateQuery },
          {
            arrayFilters: [{ "elem.category": category }, conFilter],
          }
        );
      }

      return { success: true,  message: `the data is updated successfully in projects type` };
    }

    if (singleObject.includes(collection_type)) {
      // Replace entire data array
      const new_data = Array.isArray(meta_data) ? meta_data : [meta_data];

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: new_data } }
      );

      return { success: true,  message: `Update done for ${collection_type}` };
    }

    if (multipleObject.includes(collection_type)) {
      const keys = Object.keys(original_data);

      const updateQuery = {};
      keys.forEach((key) => {
        updateQuery[`data.$[elem].${key}`] = meta_data[key];
      });

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: updateQuery },
        { arrayFilters: [{ elem: original_data }] } // matches element exactly
      );

      return { success: true,  message: `Update done for ${collection_type}` };
    }

    // ---------- FALLBACK ----------
    throw new Error("Invalid collection type");
  } catch (error) {
    console.error("Error in updateData:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { updateData };
