async function updateData(tempDoc, mainCollection) {

  try {
    
    const { collection_type, category, meta_data } = tempDoc;
    
    if (!collection_type || !category || !meta_data) {
      throw new Error("collection_type, category, and meta_data are required");
  }
  
  // Find the main document
  const existingDoc = await mainCollection.findOne({ type: collection_type });
  if (!existingDoc) throw new Error("Type not found");
  
  // Find category index
  const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }
  
  // Merge the existing content with the new meta_data
  if (typeof existingDoc.data[categoryIndex].content === "object" && !Array.isArray(existingDoc.data[categoryIndex].content)) {
    // For object-based content (like level1, level2, etc.)
    existingDoc.data[categoryIndex].content = {
      ...existingDoc.data[categoryIndex].content,
      ...meta_data
    };
  } else {
    // For array-based content (like section & level, another, etc.)
    existingDoc.data[categoryIndex].content = meta_data;
  }

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );
  
  return { success: true,  message: "Data updated successfully" };
} catch (error) {

  console.error(error);
  return { success: false, error: error.message };
  
}
}

module.exports = { updateData };
