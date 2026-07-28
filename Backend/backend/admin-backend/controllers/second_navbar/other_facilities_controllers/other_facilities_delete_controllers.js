async function deleteData(tempDoc, mainCollection) {
  try {
    const {
      collection_type,
      category,
      meta_data
    } = tempDoc;

    const existingDoc = await mainCollection.findOne({
      type: collection_type
    });

    if (!existingDoc) {
      return {
        success: false,
        message: "Type not found"
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

    if (meta_data?.delete_category) {
      existingDoc.data = existingDoc.data.filter(
        item => item.category !== category
      );
    } else {
      const isEqual = (a, b) =>
        a.name === b.name &&
        a.description === b.description &&
        a.image_path === b.image_path;
      
      
      categoryDoc.content = categoryDoc.content.filter(
        dbItem =>
          !meta_data.content.some(oldItem => isEqual(dbItem, oldItem))
      );
      
      // Remove category if no content remains
      if (categoryDoc.content.length === 0) {
        existingDoc.data = existingDoc.data.filter(
          item => item.category !== category
        );
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