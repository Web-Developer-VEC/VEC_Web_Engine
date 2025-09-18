async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !category || !original_data) {
      throw new Error(
        "collection_type, category, meta_data, and original_data are required"
      );
    }

    if (collection_type === "hod") {
      if (category === "hod_details") {
        // const new_data = Array.isArray(meta_data)?meta_data:[meta_data];
        // Update inside content array
        await mainCollection.updateOne(
          {
            type: collection_type,
            "data.category": "hod_details"
          },
          {
            $set: { "data.$[cat].content.$[cont]": meta_data }
          },
          {
            arrayFilters: [
              { "cat.category": "hod_details" },
              { "cont.unique_id": original_data.unique_id} 
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
