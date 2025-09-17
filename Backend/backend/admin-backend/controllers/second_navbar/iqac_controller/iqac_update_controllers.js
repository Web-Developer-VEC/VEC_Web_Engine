async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;
    const department_name = meta_data?.department_name;

    if (!collection_type || !meta_data) {
      return { success: false, error: "collection_type and meta_data are required" };
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) return { success: false, error: "Document not found" };
    if (!doc.data) return { success: false, error: "Document has no data field" };

    // 1️⃣ Single-doc types → overwrite whole data
    const singleObjectTypes = ["objectives"];
    if (singleObjectTypes.includes(collection_type)) {
      const updatedData = { ...doc.data, ...meta_data };
      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: "No document was updated. Check type or data structure." };
      }

      return { success: true, message: `Updated successfully for ${collection_type}`, data: updatedData };
    }

const ObjectTypes = ["coordinator"];

if (ObjectTypes.includes(collection_type)) {
  if (!meta_data) {
    return { success: false, error: "meta_data is required" };
  }

  const updateOps = {};

  // Only update fields provided in meta_data
  for (const key in meta_data) {
    updateOps[`data.${key}`] = meta_data[key];
  }

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: updateOps }
  );

  return {
    success: true,
    message: `Updated successfully in ${collection_type}`,
    data: meta_data
};
}


    // 2️⃣ Multi-doc types → update object by matching original_data
    const multiDocTypes = ["minutes_of_meetings", "strategic_plan", "best_practices", "institutional_distinctiveness", "code_of_ethics", "aqar", "iso_certificate"];
    if (multiDocTypes.includes(collection_type)) {
      if (!original_data) {
        return { success: false, error: "original_data is required for multi-doc updates" };
      }

      const updatedData = doc.data.map((item) =>
        JSON.stringify(item) === JSON.stringify(original_data)
          ? { ...item, ...meta_data }
          : item
      );

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      return { success: true, message: `Updated successfully for ${collection_type}`, data: meta_data };
    }

    // 3️⃣ Department-based: academic_admin_audit
    const departmentBasedTypes = ["academic_admin_audit"];
    if (departmentBasedTypes.includes(collection_type)) {
      if (!department_name) {
        return { success: false, error: "department_name is required" };
      }

      const deptExists = doc.data.find((d) => d.department_name === department_name);
      if (!deptExists) return { success: false, error: `Department ${department_name} not found` };
      if (!original_data) return { success: false, error: "original_data required" };

      const updatedDept = {
        ...deptExists,
        department_name: meta_data.department_name || deptExists.department_name,
        year: Array.isArray(meta_data.year) ? meta_data.year : deptExists.year,
        path: Array.isArray(meta_data.path) ? meta_data.path : deptExists.path,
      };

      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $set: { "data.$[elem]": updatedDept } },
        { arrayFilters: [{ "elem.department_name": department_name }] }
      );

      if (result.modifiedCount === 0) {
        console.error("Update failed → No matching department found");
      }

      return { success: true, message: `Updated successfully in ${collection_type} - department ${department_name}`, data: meta_data };
    }

    // 4️⃣ Category-based: members, gallery
    const categoryBasedTypes = ["members", "gallery"];
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) return { success: false, error: "category is required" };

      const categoryExists = doc.data.find((c) => c.category === category);
      if (!categoryExists) return { success: false, error: `Category ${category} not found` };

      const members = categoryExists.members;
      const paths = categoryExists.paths;

      // Case A: members
      if (collection_type === "members" && Array.isArray(members)) {
        if (!original_data) return { success: false, error: "original_data required" };

        const isEqual = (obj1, obj2) => Object.keys(obj1).every((key) => obj2[key] === obj1[key]);
        const updatedArray = members.map((item) =>
          isEqual(item, original_data) ? { ...item, ...meta_data } : item
        );

        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].members": updatedArray } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      // Case B: gallery
      else if (collection_type === "gallery" && Array.isArray(paths)) {
        if (!original_data) return { success: false, error: "original_data required" };

        const originalArray = Array.isArray(original_data?.paths)
          ? original_data.paths
          : Array.isArray(original_data)
          ? original_data
          : [original_data];

        const metaArray = Array.isArray(meta_data?.paths)
          ? meta_data.paths
          : Array.isArray(meta_data)
          ? meta_data
          : [meta_data];

        const updated = paths.map((item) =>
          originalArray.includes(item) ? metaArray[originalArray.indexOf(item)] || item : item
        );

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $set: { "data.$.paths": updated } }
        );
      }

      return { success: true, message: `Updated successfully in ${collection_type} - category ${category}`, data: meta_data };
    }

    return { success: false, error: "No matching case found" };
  } catch (err) {
    console.error("❌ Error updating data:", err);
    return { success: false, error: "Internal server error", details: err.message };
  }
}

module.exports = { updateData };
