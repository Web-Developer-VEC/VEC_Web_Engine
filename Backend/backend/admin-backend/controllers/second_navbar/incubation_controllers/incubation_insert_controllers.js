async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    const singleObject = ["home"];
    const multipleObject = [
      "start_up",
      "incubation_committee",
      "facilities",
      "patent",
      "seed_money"
    ];
    const categoryObjects = ["projects"];

    // Handle category-based collections
    if (categoryObjects.includes(collection_type)) {
      if (!category) {
        throw new Error("category is required for category-based collections");
      }

      const categoryExist = doc?.data?.find((c) => c.category === category);

      if (categoryExist) {
        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $push: { "data.$.content": meta_data } }
        );
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: { category, content: [meta_data] } } }
        );
      }

      return { success: true,  message: `Insertion successful in ${collection_type} (category: ${category})` };
    }

    // Handle single-object collections
    if (singleObject.includes(collection_type)) {
      const new_data = Array.isArray(meta_data) ? meta_data : [meta_data];
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: new_data } }
      );

      return { success: true,  message: `Insertion successful in ${collection_type}` };
    }

    // Handle multiple-object collections
    if (multipleObject.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $push: { data: meta_data } }
      );

      return { success: true,  message: `Insertion successful in ${collection_type}` };
    }

    // ---------- FALLBACK ----------
    throw new Error("Invalid collection type");
  } catch (error) {
    console.error("Error in insertData:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { insertData };
