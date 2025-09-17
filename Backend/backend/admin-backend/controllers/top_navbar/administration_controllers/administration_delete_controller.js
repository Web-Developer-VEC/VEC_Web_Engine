async function deleteData(tempDoc, mainCollection) {
  try {
    if (!tempDoc || typeof tempDoc !== "object") throw new Error("Invalid tempDoc format.");
    const { collection_type, meta_data , category } = tempDoc;
    if (!collection_type || meta_data === undefined || meta_data === null || typeof meta_data !== "object")
      throw new Error("collection_type and meta_data are required");

    console.log("Incoming collection_type:", collection_type);


    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error(`Type '${collection_type}' does not exist. Cannot delete from non-existent collection.`);

    // Allowed types
    const allowedSingleTypes = ["principal", "HandBook", "HRHandBook", "organization_chart"];
    const allowedArrayTypes = [ "admin_office", "committee"];
    const allAllowedTypes = [...allowedSingleTypes, ...allowedArrayTypes];

    // if (!allAllowedTypes.includes(collection_type)) {
    //   throw new Error(`'${collection_type}' is not a valid collection type.`);
    // }

    // Block organization_chart delete
    if (collection_type === "organization_chart") {
      throw new Error(`Delete not allowed for single-object type '${collection_type}'.`);
    }

    if(collection_type == "dean_and_association"){
      
      if (!category) {
        throw new Error("Category is required for this collection type");
      }
      
      const existingCategory = doc.data.find((c) => c.category === category);
      if (!existingCategory) {
        throw new Error(`Category ${category} not found`);
      }
      
      const content = existingCategory.members;
      if (
        typeof meta_data === "object" &&
        Object.keys(meta_data).length > 0
      ) {
        const isEqual = (obj1, obj2) => {
          return (
            Object.keys(obj1).length === Object.keys(obj2).length &&
            Object.keys(obj1).every((key) => obj2[key] === obj1[key])
          );
        };
        console.log("dinesh");

        // ✅ Use filter instead of map to remove matching item
        const updatedContent = (Array.isArray(content) ? content : []).filter(
          (item) => !isEqual(item, meta_data)
        );

        const result =await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].members": updatedContent } },
          { arrayFilters: [{ "elem.category": category }] }
        );

        console.log(result);
        
        return {
          message: `Deleted item from ${category} in ${collection_type}`,
        };
      }
    }else {
  return {
    success: false,
    message: `Invalid meta_data format for ${collection_type}`,
  };
}
    if (Object.keys(meta_data).length === 0) {
      if (allowedArrayTypes.includes(collection_type)) {
        doc.data = [];
      } else if (allowedSingleTypes.includes(collection_type)) {
        doc.data = {};
      }
      await mainCollection.updateOne({ type: collection_type }, { $set: { data: doc.data } });
      return { success: true, message: `All data cleared from '${collection_type}'.` };
    }

    // Array/object type: data is an array, remove entries matching meta_data
    if (allowedArrayTypes.includes(collection_type)) {
      if (!Array.isArray(doc.data)) throw new Error(`Data structure error: 'data' should be an array for '${collection_type}'`);
      // Remove all items matching all key-value pairs in meta_data
      doc.data = doc.data.filter(item =>
        !Object.entries(meta_data).every(([k, v]) => item[k] === v)
      );
      await mainCollection.updateOne({ type: collection_type }, { $set: { data: doc.data } });
      return { success: true, message: `${collection_type} entry(ies) deleted as per meta_data.` };
    }

    // Singleton type: object
    if (allowedSingleTypes.includes(collection_type)) {
      function deepDelete(target, meta) {
        if (Array.isArray(target) && Array.isArray(meta)) {
          // Remove all values in meta from target array
          return target.filter(item =>
            !meta.some(metaItem => JSON.stringify(metaItem) === JSON.stringify(item))
          );
        } else if (typeof target === "object" && typeof meta === "object" && target && meta) {
          Object.keys(meta).forEach(key => {
            if (Array.isArray(target[key]) && Array.isArray(meta[key])) {
              target[key] = deepDelete(target[key], meta[key]);
            } else if (typeof target[key] === "object" && typeof meta[key] === "object" && target[key] && meta[key]) {
              target[key] = deepDelete(target[key], meta[key]);
              if (Object.keys(target[key]).length === 0) {
                delete target[key];
              }
            } else if (target.hasOwnProperty(key)) {
              delete target[key];
            }
          });
          return target;
        }
        return target;
      }
      const before = JSON.stringify(doc.data);
      doc.data = deepDelete(doc.data, meta_data);
      if (JSON.stringify(doc.data) === before) {
        return { success: false, message: `No matching field(s) or value(s) to delete in ${collection_type}` };
      }
      await mainCollection.updateOne({ type: collection_type }, { $set: { data: doc.data } });
      return { success: true, message: `${collection_type} data deleted as per meta_data.` };
    }

    throw new Error("Invalid collection type logic branch reached.");
  } catch (error) {
    console.error(error);
    throw { success: false, error: error.message || "Unknown error on delete" };
  }
}

module.exports = { deleteData };