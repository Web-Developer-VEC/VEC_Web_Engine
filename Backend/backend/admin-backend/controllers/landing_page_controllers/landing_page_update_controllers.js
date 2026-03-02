async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Type, meta_data, and original_data required");
    }

    const singleObjectTypes = ["page_details","banner", "special_announcements"]

    const multipleObjectTypes = ["notifications", "announcements", "events", "department_banner"];


    if (multipleObjectTypes.includes(collection_type)) {

      const doc = await mainCollection.findOne({ type: collection_type });
      if (!doc) throw new Error("Collection not found");

      const keys = Object.keys(original_data);

      const updateQuery = {};
      keys.forEach(key => {
        updateQuery[`data.$[elem].${key}`] = meta_data[key];
      });
      // Update the document in DB
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: updateQuery},
        {arrayFilters:[{"elem":original_data}]}
      );

      return {
        success: true,
        message: `${collection_type} updated successfully`,
      };
    }

    if(singleObjectTypes.includes(collection_type)){

      const doc = await mainCollection.findOne({ type: collection_type });

         if (!doc) {
                throw new Error("Document with the specified collection_type not found");
            }

            
            const new_data = Array.isArray(meta_data)?meta_data:[meta_data];
console.log(new_data);

            await mainCollection.updateOne(
                { type: collection_type },
                { $set: { data: new_data } }
            );

            return { message: `Data updated successfully into ${collection_type}`};


       }

    // ---------- FALLBACK ----------
    throw new Error("Invalid collection type");

  } catch (error) {
    console.error("Error in updateData:", error.message);
    throw error;
  }
}

module.exports = { updateData };
