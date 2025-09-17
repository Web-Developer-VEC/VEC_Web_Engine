async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;
    const department_name = meta_data?.department_name;

    if (!collection_type) {
      return { success: false, error: "collection_type is required" };
    }

    // Define types
    const singleObjectTypes = ["objectives"];
    const multiDocTypes = ["coordinator", "strategic_plan", "institutional_distinctiveness", "code_of_ethics", "aqar", "iso_certificate", "best_practices", "minutes_of_meetings"];
    const categoryBasedTypes = ["members", "gallery"];
    const departmentBasedTypes = ["academic_admin_audit"];

    // 1️⃣ Single-doc → clear all data or specific array items
    if (singleObjectTypes.includes(collection_type)) {
      const doc = await mainCollection.findOne({ type: collection_type });

      if (!doc || !doc.data) {
        return { success: false, error: "Document not found for this type" };
      }

      if (!meta_data || Object.keys(meta_data).length === 0) {
        return { success: false, error: "meta_data required for deletion" };
      }

      const updatedData = { ...doc.data };
      Object.keys(meta_data).forEach((key) => {
        if (updatedData.hasOwnProperty(key)) delete updatedData[key];
      });

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      return { success: true, message: `Deleted specified fields for ${collection_type}`, data: updatedData };
    }

    // 2️⃣ Multi-doc → delete object by key(s)
    if (multiDocTypes.includes(collection_type)) {
      if (!meta_data || Object.keys(meta_data).length === 0) {
        return { success: false, error: "meta_data required to delete specific item" };
      }

      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: meta_data } }
      );

      return { success: true, message: `Deleted one document from ${collection_type}`, deleted: meta_data };
    }

    // 3️⃣ Category-based → delete by category or content
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) {
        return { success: false, error: "category is required" };
      }

      const doc = await mainCollection.findOne({ type: collection_type });
      const categoryExists = doc?.data?.find((c) => c.category === category);
      if (!categoryExists) {
        return { success: false, error: `Category ${category} not found` };
      }

      // Members
      if (collection_type === "members") {
        if (!meta_data || (Array.isArray(meta_data.members) && meta_data.members.length === 0)) {
          await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { data: { category } } }
          );
        } else {
          const itemsToDelete = Array.isArray(meta_data.members) ? meta_data.members : [meta_data];
          const titlesToDelete = itemsToDelete.map((item) => item.title);

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $pull: { "data.$.members": { title: { $in: titlesToDelete } } } }
          );
        }
      }
      // Gallery
      else if (collection_type === "gallery") {
        if (!meta_data || (Array.isArray(meta_data.paths) && meta_data.paths.length === 0)) {
          await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { data: { category } } }
          );
        } else {
          const itemsToDelete = Array.isArray(meta_data.paths) ? meta_data.paths : [meta_data];

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $pull: { "data.$.paths": { $in: itemsToDelete } } }
          );
        }
      }

      return { success: true, message: `Delete successful for ${collection_type} - category ${category}`, data: meta_data };
    }

    // 4️⃣ Department-based → delete by department or content
    if (departmentBasedTypes.includes(collection_type)) {
      if (!department_name) {
        return { success: false, error: "Department name is required" };
      }

      const doc = await mainCollection.findOne({ type: collection_type });
      const departmentExists = doc?.data?.find((d) => d.department_name === department_name);

      if (!departmentExists) {
        return { success: false, error: `Department ${department_name} not found` };
      }

      const yearsArray = Array.isArray(departmentExists.year) ? departmentExists.year : [];
      const pathsArray = Array.isArray(departmentExists.path) ? departmentExists.path : [];

      if (!meta_data || !meta_data.year || meta_data.year.length === 0) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { department_name } } }
        );
      } else {
        const yearsToDelete = Array.isArray(meta_data.year) ? meta_data.year : [meta_data.year];
        const updatedYears = [];
        const updatedPaths = [];

        for (let i = 0; i < yearsArray.length; i++) {
          if (!yearsToDelete.includes(yearsArray[i])) {
            updatedYears.push(yearsArray[i]);
            updatedPaths.push(pathsArray[i]);
          }
        }

        await mainCollection.updateOne(
          { type: collection_type, "data.department_name": department_name },
          { $set: { "data.$.year": updatedYears, "data.$.path": updatedPaths } }
        );
      }

      return { success: true, message: `Delete successful for ${collection_type} - department ${department_name}`, data: meta_data };
    }

    return { success: false, error: "Invalid delete request" };
  } catch (error) {
    console.error("Error deleting data:", error);
    return { success: false, error: "Internal server error", details: error.message };
  }
}

module.exports = { deleteData };
