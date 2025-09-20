// ------------------- DELETE -------------------
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !category || !meta_data || !meta_data.S_NO) {
      throw new Error("collection_type, category, and meta_data.S_NO are required");
    }

    // Fetch the existing document (entire doc)
    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document not found");

    // Go through all categories inside doc.data
    const updatedData = doc.data.map((cat) => {
      if (cat.category !== category) return cat; // skip other categories

      // Filter by S_NO inside this category
      let records = cat.content || [];
      const initialLength = records.length;

      records = records.filter((item) => item.S_NO !== meta_data.S_NO);

      if (records.length === initialLength) {
        throw new Error("No record found with the given S_NO");
      }

      // Re-index S_NO values
      records = records.map((item, index) => ({
        ...item,
        S_NO: index + 1,
      }));

      return {
        ...cat,
        content: records,
      };
    });

    // Update the document with full data
    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data: updatedData } }
    );

    return { success: true, message: "MoU record deleted and reindexed successfully" };
  } catch (error) {
    console.error(error);
    throw error; // ❌ match insertData style
  }
}

module.exports = { deleteData };
