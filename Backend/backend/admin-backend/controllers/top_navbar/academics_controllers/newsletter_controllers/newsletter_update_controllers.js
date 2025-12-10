async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !category || !original_data) {
      throw new Error(
        "collection_type, category, meta_data, and original_data are required"
      );
    }

    if (collection_type === "newsletter") {
      if (category === "newsletter") {
        // Update inside content array
        await mainCollection.updateOne(
          {
            type: collection_type,
            "data.category": "newsletter"
          },
          {
            $set: { "data.$[cat].content.$[cont]": meta_data }
          },
          {
            arrayFilters: [
              { "cat.category": "newsletter" },
              { "cont": original_data } 
            ]
          }
        );

        return {
          message: `The data is updated successfully in the ${collection_type}`
        };
      } 
    }
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}

module.exports = { updateData };
