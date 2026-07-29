async function updateData(tempDoc, mainCollection) {
  try {
    const {
      collection_type,
      category,
      meta_data,
      original_data
    } = tempDoc;

    const existingDoc = await mainCollection.findOne({
      type: collection_type
    });

    if (!existingDoc) {
      return {
        success: false,
        message: "Type does not exist"
      };
    }

    const categoryDoc = existingDoc.data.find(
      item => item.category === category
    );

    if (!categoryDoc) {
      return {
        success: false,
        message: "Category not found"
      };
    }

    const isEqual = (a, b) =>
      a.name === b.name &&
      a.description === b.description &&
      a.image_path === b.image_path;

    for (let i = 0; i < original_data.content.length; i++) {
      const oldItem = original_data.content[i];
      const newItem = meta_data.content[i];

      const index = categoryDoc.content.findIndex(item =>
        isEqual(item, oldItem)
      );

      if (index !== -1) {
        categoryDoc.content[index] = newItem;
      }
    }

    await mainCollection.updateOne(
      { type: collection_type },
      {
        $set: {
          data: existingDoc.data
        }
      }
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