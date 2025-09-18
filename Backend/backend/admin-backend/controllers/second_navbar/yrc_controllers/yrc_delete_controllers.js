async function deleteData( tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type)
      throw new Error("collection_type is required");

    const singleDocTypes = ["about","news_updates"];
    const multiDocTypes = ["events","awards"];
    const categoryBasedTypes = [
      "team"
    ];

    // 1️⃣ Single-doc → clear all data
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: [] } }
      );
      return {
       
        message: `Deleted entire document for ${collection_type}`,
      };
    }

    // 2️⃣ Multi-doc → delete item by unique key or full object
    if (multiDocTypes.includes(collection_type)) {
      if (!meta_data || Object.keys(meta_data).length === 0)
        throw new Error("meta_data required to delete specific item");

      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: meta_data } }
      );
      return {
       
        message: `Deleted one document from ${collection_type}`,
        deleted: meta_data,
      };
    }

    // 3️⃣ Category-based
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category)
        throw new Error("category is required");

      const doc = await mainCollection.findOne({ type: collection_type });
      const categoryExists = doc?.data?.find((c) => c.category === category);
      if (!categoryExists)
        throw new Error(`Category ${category} not found`);

      const content = categoryExists.members;

      if (
        !meta_data ||
        (typeof meta_data === "object" &&
          !Array.isArray(meta_data) &&
          Object.keys(meta_data).length === 0) ||
        (Array.isArray(meta_data) && meta_data.length === 0) ||
        (meta_data.content && meta_data.content.length === 0)
      ) {
        // Delete entire category
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category } } }
        );
      }
      //   else if (Array.isArray(content) && typeof content[0] === "string") {
      //     // Delete string items
      //     const itemsToDelete = Array.isArray(meta_data.content)
      //       ? meta_data.content
      //       : [meta_data];
      //     await mainCollection.updateOne(
      //       { type: collection_type, "data.category": category },
      //       { $pull: { "data.$.content": { $in: itemsToDelete } } }
      //     );
      //   }
      else if (Array.isArray(content) && typeof content[0] === "object") {
        // Delete object(s) by name (or other unique key)
        const itemsToDelete = Array.isArray(meta_data.content)
          ? meta_data.content
          : [meta_data];

        const titlesToDelete = itemsToDelete.map((item) => item.name);

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $pull: { "data.$.members": { name: { $in: titlesToDelete } } } }
        );
      } else {
        // Fallback: clear members
        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $set: { "data.$.members": [] } }
        );
      }

      return {
       
        message: `Delete successful for ${collection_type} - category ${category}`,
        data: meta_data,
      };
    }

    throw new Error("Invalid delete request");
  } catch (error) {
    console.error("Error deleting data:", error);
    throw new Error("Internal server error");
  }
}

module.exports = { deleteData };
