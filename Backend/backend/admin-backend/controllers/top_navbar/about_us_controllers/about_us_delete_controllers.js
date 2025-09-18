async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error(
        "Missing required fields: collection_type, category, or meta_data"
      );
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    const categoryBasedtypes = ["AISHE"];

    if (!doc) {
      throw new Error(`Document with type ${collection_type} not found`);
    }

    if (categoryBasedtypes.includes(collection_type)) {
      if (!category) {
        throw new Error("Category is required for this collection type");
      }

      const existingCategory = doc.data.find((c) => c.category === category);
      if (!existingCategory) {
        throw new Error(`Category ${category} not found`);
      }

      const content = existingCategory.content;
      if (
        typeof meta_data[0] === "object" &&
        Object.keys(meta_data).length === 0
      ) {
        const isEqual = (obj1, obj2) => {
          return (
            Object.keys(obj1).length === Object.keys(obj2).length &&
            Object.keys(obj1).every((key) => obj2[key] === obj1[key])
          );
        };

        // ✅ Use filter instead of map to remove matching item
        const updatedContent = (Array.isArray(content) ? content : []).filter(
          (item) => !isEqual(item, meta_data)
        );

        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": updatedContent } },
          { arrayFilters: [{ "elem.category": category }] }
        );
        return {
          message: `Deleted item from ${category} in ${collection_type}`,
        };
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category: category } } }
        );
        return {
          message: `Deleted item from ${category} in ${collection_type}`,
        };
      }
    } else {
      // Fallback: clear content if not objects

      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { category: category } } }
      );
      return {
        message: `Cleared content in ${category} of ${collection_type}`,
      };
    }
  } catch (error) {
    throw new Error(`Error deleting data: ${error.message}`);
  }
}
module.exports = { deleteData };
