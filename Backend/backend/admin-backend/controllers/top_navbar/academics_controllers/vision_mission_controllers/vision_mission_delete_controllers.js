async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }
    if (collection_type !== "vision_and_mission") {
      throw new Error("Incorrect collection type or route");
    }

    const categoryBasedTypes = ["vision_and_mission"];

    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) throw new Error("category is required");

      const doc = await mainCollection.findOne({ type: collection_type });
      if (!doc) {
        return {
          status: 404,
          message: `No document found for type ${collection_type}`,
        };
      }

      const categoryExists = doc.data.find((c) => c.category === category);
      if (!categoryExists) {
        return {
          status: 404,
          message: `Category ${category} not found in ${collection_type}`,
        };
      }

      // normalize deletion targets
      const itemsToDelete = Array.isArray(meta_data?.content)
        ? meta_data.content
        : [meta_data];

      // case 1: deleting strings directly
      if (typeof categoryExists.content[0] === "string") {
        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $pull: { "data.$.content": { $in: itemsToDelete } } }
        );
      } 
      // case 2: deleting objects (e.g. header/content pairs)
      else if (typeof categoryExists.content[0] === "object") {
        for (const item of itemsToDelete) {
          const query = {};
          if (item.header) query.header = item.header;
          if (item.content) query.content = item.content;

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $pull: { "data.$.content": query } }
          );
        }
      }

      // cleanup: remove category if empty
      const updatedDoc = await mainCollection.findOne({ type: collection_type });
      const updatedCategory = updatedDoc.data.find((c) => c.category === category);

      if (!updatedCategory || updatedCategory.content.length === 0) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category } } }
        );
      }

      return {
        status: 200,
        message: `Delete successful for ${collection_type} - category ${category}`,
        deleted: itemsToDelete,
      };
    }

    return {
      status: 400,
      message: `Delete not supported for collection_type ${collection_type}`,
    };
  } catch (error) {
    console.error("❌ Error deleting vision_and_mission data:", error);
    return {
      status: 500,
      message: "Server error",
      details: error.message,
    };
  }
}

module.exports = { deleteData };
