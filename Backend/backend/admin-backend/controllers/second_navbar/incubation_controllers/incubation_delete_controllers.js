async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    const multipleObject = [
      "start_up",
      "incubation_committee",
      "facilities",
      "projects",
      "patent",
      "seed_money",
    ];

    const categoryObjects = ["projects"];

    if (categoryObjects.includes(collection_type)) {
      const doc = await mainCollection.findOne({ type: collection_type });

      const categoryExist = doc.data.find((c) => c.category === category);

      if (categoryExist) {
        if (!category) {
          throw new Error("category ir required");
        }

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $pull: { "data.$.content": meta_data } }
        );
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category: category } } }
        );
  
        return { success: true,  message: "the entire category is deleted for projects" };
      }
      
      return { success: true,  message: `the data is deleted successfully in projects type` };
    }

    if (multipleObject.includes(collection_type)) {
      // Delete specific item(s) from data array using meta_data to match
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: meta_data } }
      );

      return { success: true,  message: `Item deleted from ${collection_type}` };
    }

    // ---------- FALLBACK ----------
    throw new Error("Invalid collection type");
  } catch (error) {
    console.error("Error in deleteData:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { deleteData };
