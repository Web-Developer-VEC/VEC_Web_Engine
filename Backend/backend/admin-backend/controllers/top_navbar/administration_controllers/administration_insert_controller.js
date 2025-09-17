

function isLink(val) {
  return (
    typeof val === "string" &&
    (val.startsWith("http") ||
      val.includes("/static/") ||
      val.match(/\.(pdf|jpg|png|jpeg)$/i))
  );
}

function hasKeyForLinks(meta_data) {
  // If any value is a link, there must be a distinct key (not the link field) with a non-link descriptor value.
  for (const [key, value] of Object.entries(meta_data)) {
    if (isLink(value) || (Array.isArray(value) && value.some(isLink))) {
      // Check for another key that is not a link and is string/number
      const hasDescriptor = Object.entries(meta_data).some(
        ([otherKey, otherVal]) =>
          otherKey !== key &&
          ((typeof otherVal === "string" && !isLink(otherVal) && otherVal.trim().length > 0) ||
            (typeof otherVal === "number" && !isNaN(otherVal)))
      );
      if (!hasDescriptor) return false;
    }
  }
  return true;
}

async function insertData(tempDoc, mainCollection) {
  try {
    if (!tempDoc || typeof tempDoc !== "object") throw new Error("Invalid tempDoc format.");
    const { collection_type, meta_data, category } = tempDoc;
    if (!collection_type || !meta_data) throw new Error("Type and meta_data required");

    // Allowed types
    const allowedSingleTypes = ["principal", "HandBook", "HRHandBook", "organization_chart"];
    const allowedArrayTypes = ["dean_and_association", "admin_office", "committee"];
    const allAllowedTypes = [...allowedSingleTypes, ...allowedArrayTypes];

    if (!allAllowedTypes.includes(collection_type)) {
      throw new Error(`'${collection_type}' is not a valid collection type.`);
    }

    // Find the document for the given collection_type
    let doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error(`Type '${collection_type}' does not exist. Cannot insert to non-existent collection.`);

    // Block HRHandBook and organization_chart insert
    if (collection_type === "HRHandBook" || collection_type === "organization_chart") {
      throw new Error(`Insert not allowed for single-object type '${collection_type}'.`);
    }

    // HandBook: require BOTH Years and pdfs_path arrays of equal length
    if (collection_type === "HandBook") {
      
      await mainCollection.updateOne({ type: collection_type }, { $set: { data: meta_data } });
      return { success: true, message: `HandBook arrays appended successfully` };
    }

    // dean_and_association: append (no replace) to array, prevent duplicate names, require name for any link
    if (collection_type === "dean_and_association") {
      if (!Array.isArray(doc.data)) {
        throw new Error(
          `Data structure error: 'data' should be an array for '${collection_type}', got ${typeof doc.data}`
        );
      }
      if (!meta_data.name) {
        throw new Error(`meta_data.name required to append to '${collection_type}'.`);
      }
      if (!hasKeyForLinks(meta_data)) {
        throw new Error(
          "A key/descriptor (like name, year, or label) is required for each link you append."
        );
      }

      const categoryExists = doc.data.find((c) => c.category === category);
      if (categoryExists){
        await mainCollection.updateOne(
          {type:collection_type, "data.category": category},
          {$push:{"data.$.members":meta_data}}
        )
      }
      return { success: true, message: `${collection_type} entry appended successfully` };
    }

    // admin_office and committee: append (no replace) to array, prevent duplicate name, require name for any link
    if (collection_type === "admin_office" || collection_type === "committee") {
      if (!Array.isArray(doc.data)) {
        throw new Error(
          `Data structure error: 'data' should be an array for '${collection_type}', got ${typeof doc.data}`
        );
      }
      if (!meta_data.name) {
        throw new Error(`meta_data.name required to append to '${collection_type}'.`);
      }
      if (!hasKeyForLinks(meta_data)) {
        throw new Error(
          "A key/descriptor (like name, year, or label) is required for each link you append."
        );
      }
      const alreadyExists = doc.data.some((item) => item.name === meta_data.name);
      if (alreadyExists) {
        throw new Error(
          `Entry with the same name already exists in '${collection_type}'. Insert would cause duplicate.`
        );
      }
      doc.data.push(meta_data);
      await mainCollection.updateOne({ type: collection_type }, { $set: { data: doc.data } });
      return { success: true, message: `${collection_type} entry appended successfully` };
    }

    // principal: allow append—overwrite or merge (here: shallow merge)
    if (collection_type === "principal") {
      if (typeof meta_data !== "object" || Array.isArray(meta_data)) {
        throw new Error(`meta_data must be an object for 'principal' insert`);
      }
      if (!hasKeyForLinks(meta_data)) {
        throw new Error(
          "A key/descriptor (like name, year, or label) is required for each link you append."
        );
      }
      doc.data = { ...doc.data, ...meta_data }; // shallow merge/overwrite
      await mainCollection.updateOne({ type: collection_type }, { $set: { data: doc.data } });
      return { success: true, message: `principal data updated successfully` };
    }

    throw new Error("Invalid collection type logic branch reached.");
  } catch (error) {
    console.error(error);
    throw { success: false, error: error.message || "Unknown error on insert" };
  }
}

module.exports = { insertData };