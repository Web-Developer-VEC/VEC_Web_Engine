async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    
    // ---------- MOUS ----------
    if (collection_type === "mous") {
      if (!category) throw new Error("Category required for mous");

      if (doc) {
        const categoryExists = doc.data.find((c) => c.category === category);

        if (categoryExists) {
          // If category exists → push into its content
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $push: { "data.$.content": meta_data } }
          );
        } else {
          // If category doesn't exist → add new category
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { category, content: [meta_data] } } }
          );
        }
      } else {
        // If no doc exists → create fresh
        await mainCollection.insertOne({
          type: collection_type,
          data: [{ category, content: [meta_data] }],
        });
      }

      return { success: true, message: "MoU data inserted successfully" };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ no res.json, just throw
  }
}

module.exports = { insertData };
