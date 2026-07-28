async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !category || !original_data) {
      throw new Error(
        "collection_type, category, meta_data, and original_data are required"
      );
    }
    if (collection_type !== "student_achievements") {
      throw new Error("Incorrect collection type or route");
    }

    if (collection_type === "student_achievements") {
      if (category === "student_achievements_details") {
        // Update inside images array
        await mainCollection.updateOne(
          {
            type: collection_type,
            "data.category": "student_achievements_details"
          },
          {
            $set: { "data.$[cat].images.$[cont]": meta_data }
          },
          {
            arrayFilters: [
              { "cat.category": "student_achievements_details" },
              { "cont": original_data }
            ]
          }
        );

        return {
          success: true,
          message: `The data is updated successfully in the ${collection_type}`
        };
      } else if (category === "student_achievements_content") {

        const new_data = Array.isArray(meta_data)
          ? meta_data
          : Object.values(meta_data);

        await mainCollection.updateOne(
          { type: collection_type, "data.category": "student_achievements_content" },
          {
            $set: {
              "data.$.content": new_data
            }
          }
        );
        return {
          success: true,
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
