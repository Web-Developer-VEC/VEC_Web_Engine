async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !category || !meta_data) {
      throw new Error(
        "collection_type, category, and meta_data are required"
      );
    }
    if (collection_type !== "newsletter") {
      throw new Error("Incorrect collection type or route");
    }

    if (collection_type === "newsletter") {
      if (category === "newsletter") {
    
        await mainCollection.updateOne(
          {
            type: collection_type,
            "data.category": "newsletter"
          },
          {
            $pull: { "data.$[cat].content": meta_data }
          },
          {
            arrayFilters: [{ "cat.category": "newsletter" }]
          }
        );

        return {
          message: `The data is deleted successfully from ${collection_type}`
        };
      } else {
        // Remove whole meta_data object (reset to empty)
        await mainCollection.updateOne(
          {type: collection_type},
          {$pull: { data:{category:category} }}
        );

        return {
          message: `The category is deleted successfully from ${collection_type}`
        };
      }
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
}

module.exports = { deleteData };
