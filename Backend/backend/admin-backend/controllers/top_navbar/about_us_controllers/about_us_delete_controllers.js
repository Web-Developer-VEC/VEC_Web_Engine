async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Missing required fields");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) {
      throw new Error(`Document with type ${collection_type} not found`);
    }

    const categoryBasedtypes = ["AISHE"];

    // ---------- ABOUT VEC ----------
    if (collection_type === "about_vec") {
      const result = await mainCollection.updateOne(
        { type: "about_vec" },
        { $pull: { "data.about_us_pdf": { name: meta_data.name } } }
      );

      if (result.matchedCount === 0) {
        throw new Error(`PDF "${meta_data.name}" not found`);
      }

      return { success:true, message: "about_vec PDF deleted successfully" };
    }

    // ---------- AISHE (FIXED) ----------
    if (categoryBasedtypes.includes(collection_type)) {
      if (!category) {
        throw new Error("Category is required for AISHE");
      }

      // ✅ Delete entire category
      if (meta_data.category === category) {
        await mainCollection.updateOne(
          { type: "AISHE" },
          { $pull: { data: { category } } }
        );

        return { success:true, message: `AISHE category ${category} deleted` };
      }

      // ✅ Delete single item by name
      const result = await mainCollection.updateOne(
        { type: "AISHE", "data.category": category },
        {
          $pull: {
            "data.$.content": { name: meta_data.name },
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new Error(`AISHE item not found in ${category}`);
      }

      return { success:true, message: `AISHE item deleted from ${category}` };
    }
  } catch (error) {
    throw new Error(`Error deleting data: ${error.message}`);
  }
}

module.exports = { deleteData };
