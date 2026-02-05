// ------------------- INSERT (RESEARCH) -------------------
async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }

    let doc = await mainCollection.findOne({ type: collection_type });
    const collections = ["Journal Publication", "Funded Projects", "Consultancy", "Books and Book chapters", "Policy"]
    // ---------- JOURNAL PUBLICATION ----------
    if (collections.includes(collection_type)) {
      if (doc) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: meta_data } }
        );
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: [meta_data],
        });
      }
      return {
        success: true,
        message: `${collection_type} data inserted successfully`,
      };
    }
    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ no res.json, just throw
  }
}

module.exports = { insertData };