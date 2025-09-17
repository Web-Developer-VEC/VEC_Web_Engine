
async function updateData(tempDoc, mainCollection) {
  try {
    if (!tempDoc || typeof tempDoc !== "object") throw new Error("Invalid tempDoc format.");
    const { collection_type, meta_data, original_data , category } = tempDoc;
    if (!collection_type || !meta_data || !original_data || typeof original_data !== "object" || Object.keys(original_data).length === 0)
      throw new Error("collection_type, meta_data, and original_data (with at least one identifying field) are required");

    // Allowed types
    const allowedSingleTypes = ["principal", "HandBook", "HRHandBook", "organization_chart"];
    const allowedArrayTypes = [ "admin_office", "committee"];
    const allAllowedTypes = [...allowedSingleTypes, ...allowedArrayTypes];

    // if (!allAllowedTypes.includes(collection_type)) {
    //   throw new Error(`'${collection_type}' is not a valid collection type.`);
    // }

    // Find the document for the given collection_type
    let doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error(`Type '${collection_type}' does not exist. Cannot update non-existent collection.`);

    // Handle singleton types (object, not array)
    if (allowedSingleTypes.includes(collection_type)) {
      let updated = false;

      for (const key in meta_data) {
        // Handle PATCH-style array updates (e.g. pdfs_path)
        if (
          Array.isArray(meta_data[key]) &&
          Array.isArray(doc.data[key])
        ) {
          // If original_data[key] is missing or empty or meta_data[key] is a full replacement, replace whole array
          if (
            !original_data[key] ||
            !Array.isArray(original_data[key]) ||
            original_data[key].length === 0 ||
            meta_data[key].length > 1
          ) {
            doc.data[key] = meta_data[key];
            updated = true;
          } else if (
            Array.isArray(original_data[key]) &&
            original_data[key].length === meta_data[key].length
          ) {
            // PATCH-style: replace only matching entries
            original_data[key].forEach((origVal, idx) => {
              const arr = doc.data[key];
              const foundIdx = arr.indexOf(origVal);
              if (foundIdx !== -1 && typeof meta_data[key][idx] !== "undefined") {
                arr[foundIdx] = meta_data[key][idx];
                updated = true;
              }
            });
          }
        } else {
          // Regular object field update
          doc.data[key] = meta_data[key];
          updated = true;
        }
      }
      if (updated) {
        await mainCollection.updateOne({ type: collection_type }, { $set: { data: doc.data } });
        return { success: true, message: `${collection_type} data updated successfully` };
      }
      return { success: false, message: `No matching data to update in ${collection_type}` };
    }

    // Handle array/object types (committee, admin_office, dean_and_association)
    if (allowedArrayTypes.includes(collection_type)) {
      if (!Array.isArray(doc.data)) {
        throw new Error(`Data structure error: 'data' should be an array for '${collection_type}'`);
      }
      // Find index using all key-value pairs in original_data (even if only pdf_path is given)
      const idx = doc.data.findIndex(item =>
        Object.entries(original_data).every(([k, v]) => item[k] === v)
      );
      if (idx === -1) {
        return { success: false, message: `No entry found in '${collection_type}' matching original_data: ${JSON.stringify(original_data)}` };
      }
      Object.assign(doc.data[idx], meta_data);
      await mainCollection.updateOne({ type: collection_type }, { $set: { data: doc.data } });
      return { success: true, message: `${collection_type} entry updated successfully` };
    }


    if (collection_type == "dean_and_association"){
      if(!category){
        throw new Error("category is required");
        
      }
      const categoryExists = doc.data.find((c) => c.category === category);
      const content = categoryExists.members;
      if (categoryExists){

        const isEqual = (obj1, obj2) =>
          Object.keys(obj1).every((key) => obj2[key] === obj1[key]);

        const updatedArray = (Array.isArray(content) ? content : []
        ).map((item) =>
          isEqual(item, original_data) ? { ...item, ...meta_data } : item
        );
        const upd = Array.isArray(updatedArray) ? updatedArray : updatedArray;
        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].members": upd } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      } 
      return { success: true, message: `${collection_type} entry appended successfully` };
    }

    throw new Error("Invalid collection type logic branch reached.");
  } catch (error) {
    console.error(error);
    throw { success: false, error: error.message || "Unknown error on update" };
  }
}

module.exports = { updateData };