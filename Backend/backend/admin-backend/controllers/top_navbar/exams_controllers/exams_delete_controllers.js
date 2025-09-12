async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Missing required fields: collection_type or meta_data");
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    if (!doc) {
      throw new Error("Document with the specified collection_type not found");
    }

    const multipleObjectTypes = ["exam_curriculum"];

    const categoryBasedTypes = ["COE", "regulation", "all_forms"];

    if (multipleObjectTypes.includes(collection_type)) {
      const dataExists = doc.data.find(
        (item) => JSON.stringify(item) === JSON.stringify(meta_data)
      );

      if (!dataExists) {
        throw new Error("Data not found");
      }

      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: meta_data } }
      );

      return { message: "Data deleted successfully" };
    } else if (categoryBasedTypes.includes(collection_type)) {
      if (!category) {
        throw new Error("Missing required field: category");
      }

      const categoryExists = doc.data.find(
        (item) => item.category === category
      );

      if (!categoryExists) {
        throw new Error("Category not found");
      }

      const content = collection_type ===  "COE"? categoryExists.members:collection_type === "regulation"? categoryExists.links:categoryExists.content;

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

      const updatefields =
        collection_type === "COE"
          ? "data.$[elem].members"
          : collection_type === "regulation"
          ? "data.$[elem].links"
          : "data.$[elem].content";

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { [updatefields]: updatedContent } },
        { arrayFilters: [{ "elem.category": category }] }
      );

      return { message: "Data deleted successfully" };
    }else{
        throw new Error("Unsupported collection_type");
    }
  } catch (error) {
    throw new Error(`Internal Server Error: ${error.message}`);
  }
}

module.exports = { deleteData };