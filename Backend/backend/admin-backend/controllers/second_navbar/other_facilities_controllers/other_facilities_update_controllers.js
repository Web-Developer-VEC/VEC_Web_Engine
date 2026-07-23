async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    const { update_index } = meta_data;

    const existingDoc = await mainCollection.findOne({ type: collection_type });

    if (!existingDoc) {
      return { success: false, message: "Type does not exist" };
    }

    const categoryIndex = existingDoc.data.findIndex(
      c => c.category === category
    );

    if (categoryIndex === -1) {
      return { success: false, message: "Category not found" };
    }

    const cat = existingDoc.data[categoryIndex];

    cat.name[update_index] = meta_data.name[0];
    cat.description[update_index] = meta_data.description[0];

    if (meta_data.image_path?.length) {
      cat.image_path[update_index] = meta_data.image_path[0];
    }

    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data: existingDoc.data } }
    );

    return {
      success: true,
      message: "Updated successfully"
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { updateData };