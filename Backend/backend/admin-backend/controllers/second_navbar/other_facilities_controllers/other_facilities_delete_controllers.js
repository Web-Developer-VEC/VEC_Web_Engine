async function deleteData(tempDoc, mainCollection) {

  try {

    const { collection_type, category, meta_data } = tempDoc;

    const existingDoc = await mainCollection.findOne({
      type: collection_type
    });

    const categoryIndex = existingDoc.data.findIndex(
      c => c.category === category
    );

    if (categoryIndex === -1) {
      return {
        success: false,
        message: "Category not found"
      };
    }

    if (meta_data.delete_category) {

      existingDoc.data.splice(categoryIndex, 1);

    } else {

      const cat = existingDoc.data[categoryIndex];

      const index = meta_data.delete_index;

      cat.name.splice(index, 1);
      cat.description.splice(index, 1);
      cat.image_path.splice(index, 1);

      if (
        cat.name.length === 0 &&
        cat.description.length === 0 &&
        cat.image_path.length === 0
      ) {
        existingDoc.data.splice(categoryIndex, 1);
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
      message: "Deleted successfully"
    };

  } catch (err) {

    return {
      success: false,
      error: err.message
    };

  }

}

module.exports = { deleteData };