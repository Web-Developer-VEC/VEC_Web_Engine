async function deleteData(deletetemp, mainCollection) {
  try {
  
    if (!deletetemp || typeof deletetemp !== "object")
      throw new Error("Invalid deletetemp format.");
    const { collection_type, meta_data, category } = deletetemp;
    if (!collection_type || !meta_data)
      throw new Error("Type and meta_data required");

   

    // Find the document for the given collection_type
    let doc = await mainCollection.findOne({ type: collection_type });
    if (!doc)
      throw new Error(
        `Type '${collection_type}' does not exist. Cannot insert to non-existent collection.`
      );

    // dean_and_association: append (no replace) to array, prevent duplicate names, require name for any link
    if (collection_type === "dean_and_association") {
      if (!Array.isArray(doc.data)) {
        throw new Error(
          `Data structure error: 'data' should be an array for '${collection_type}', got ${typeof doc.data}`
        );
      }
      if (!meta_data.name) {
        throw new Error(
          `meta_data.name required to append to '${collection_type}'.`
        );
      }
      const categoryExists = doc.data.find((c) => c.category === category);
      if (categoryExists) {
        if (meta_data.category === category) {
          await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { data: { category } } }
          );

          return {
            success:true, 
            message: `The entire ${category} is deleted in ${collection_type}`,
          };
        } else {
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $pull: { "data.$.members": { name: meta_data.name } } }
          );
        }
        return {
          success: true,
          message: `${collection_type} entry deleted successfully`,
        };
      }
    }

    if (collection_type === "admin_office" || collection_type === "committee") {
      await mainCollection.updateOne(
            { type: collection_type},
            { $pull: { "data": { name: meta_data.name } } }
          );

      return { success:true, message: `The data is updated into the ${collection_type}` };
    } else if (
      collection_type === "HandBook"
    ) {
      await mainCollection.updateOne(
            { type: collection_type},
            { $pull: { data: { year: meta_data.year } } }
          );

      return { success:true, message: `The data is updated into the ${collection_type}` };
    }

    throw new Error("Invalid collection type logic branch reached.");
  } catch (error) {
    console.error(error);
    throw { success: false, error: error.message || "Unknown error on insert" };
  }
}

module.exports = { deleteData };
