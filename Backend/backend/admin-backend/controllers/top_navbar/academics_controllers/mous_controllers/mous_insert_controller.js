async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (collection_type !== "mous")
    throw new Error("Invalid collection type");

  const doc = await mainCollection.findOne({ type: collection_type });
  if (!doc) throw new Error("Document not found");

  const categoryData = doc.data.find(d => d.category === category);
  if (!categoryData) throw new Error("Category not found");

  // Prevent duplicate organisation
  const duplicate = categoryData.content.find(
    c => c.organisation_name.toLowerCase() ===
      meta_data.organisation_name.toLowerCase()
  );

  if (duplicate) {
    throw new Error("MoU with this organisation already exists");
  }

  await mainCollection.updateOne(
    { type: collection_type },
    {
      $push: {
        "data.$[d].content": meta_data
      }
    },
    {
      arrayFilters: [{ "d.category": category }]
    }
  );

  return { success: true, message: "MoU inserted successfully" };
}


module.exports = { insertData };