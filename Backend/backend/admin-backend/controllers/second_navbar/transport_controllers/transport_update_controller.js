async function updateData(tempDoc, mainCollection) {
  const { collection_type, meta_data } = tempDoc;

  if (!collection_type || !meta_data?.pdf_path) {
    throw new Error("collection_type and meta_data.pdf_path are required");
  }

  // Find the main document
  const existingDoc = await mainCollection.findOne({ type: collection_type });
  if (!existingDoc) throw new Error("Transport type not found");

  if (!Array.isArray(existingDoc.data) || existingDoc.data.length === 0) {
    throw new Error("No transport data found");
  }

  // Update only pdf_path in the first object of data[]
  existingDoc.data[0].pdf_path = meta_data.pdf_path;

  // Save back to DB
  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );

  return { message: "Transport PDF updated successfully" };
}

module.exports = { updateData };
