async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;

    if (!collection_type || !meta_data) {
      return {
        success: false,
        error: "collection_type and meta_data are required",
      };
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) return { success: false, error: "Document not found" };
    if (!doc.data) return { success: false, error: "Document has no data field" };

    /* -------------------------------------------------
       1️⃣ Single-object types
    ------------------------------------------------- */
    const singleObjectTypes = ["objectives"];
    if (singleObjectTypes.includes(collection_type)) {
      const updatedData = { ...doc.data, ...meta_data };

      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: "No changes detected" };
      }

      return {
        success: true,
        message: `Updated successfully for ${collection_type}`,
        data: updatedData,
      };
    }

    /* -------------------------------------------------
       2️⃣ Object types (coordinator)
    ------------------------------------------------- */
    const ObjectTypes = ["coordinator"];
    if (ObjectTypes.includes(collection_type)) {
      const updateOps = {};
      for (const key in meta_data) {
        updateOps[`data.${key}`] = meta_data[key];
      }

      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $set: updateOps }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: "No changes detected" };
      }

      return {
        success: true,
        message: `Updated successfully in ${collection_type}`,
        data: meta_data,
      };
    }

    /* -------------------------------------------------
       3️⃣ Multi-doc types
    ------------------------------------------------- */
    const multiDocTypes = [
      "minutes_of_meetings",
      "strategic_plan",
      "best_practices",
      "institutional_distinctiveness",
      "code_of_ethics",
      "aqar",
      "iso_certificate",
    ];

    if (multiDocTypes.includes(collection_type)) {
      if (!original_data) {
        return {
          success: false,
          error: "original_data is required for multi-doc updates",
        };
      }

      const updatedData = doc.data.map((item) =>
        JSON.stringify(item) === JSON.stringify(original_data)
          ? { ...item, ...meta_data }
          : item
      );

      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: "No changes detected" };
      }

      return {
        success: true,
        message: `Updated successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    /* -------------------------------------------------
       4️⃣ Department-based (academic_admin_audit)
    ------------------------------------------------- */
    if (collection_type === "academic_admin_audit") {
      if (!original_data?.department_name) {
        return {
          success: false,
          error: "original_data.department_name is required",
        };
      }

      const originalDept = original_data.department_name;

      const deptExists = doc.data.find(
        (d) => d.department_name === originalDept
      );

      if (!deptExists) {
        return {
          success: false,
          error: `Department not found: ${originalDept}`,
        };
      }

      const normalizeArray = (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.flat().filter(Boolean))]
          : arr;

      const updatedDept = {
        department_name:
          meta_data.department_name || deptExists.department_name,

        year: meta_data.year
          ? normalizeArray(meta_data.year)
          : deptExists.year,

        pdf_path: meta_data.pdf_path
          ? normalizeArray([
              ...(deptExists.pdf_path || []),
              ...meta_data.pdf_path,
            ])
          : deptExists.pdf_path,
      };

      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $set: { "data.$[elem]": updatedDept } },
        { arrayFilters: [{ "elem.department_name": originalDept }] }
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: "Update failed: no matching department modified",
        };
      }

      return {
        success: true,
        message: `Updated successfully in ${collection_type}`,
        data: updatedDept,
      };
    }

    /* -------------------------------------------------
       5️⃣ Category-based (members, gallery)
    ------------------------------------------------- */
    const categoryBasedTypes = ["members", "gallery"];
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) {
        return { success: false, error: "category is required" };
      }

      const categoryExists = doc.data.find((c) => c.category === category);
      if (!categoryExists) {
        return { success: false, error: `Category ${category} not found` };
      }

      /* -------- members -------- */
      if (collection_type === "members") {
        if (!original_data) {
          return { success: false, error: "original_data required" };
        }

        const updatedMembers = categoryExists.members.map((m) =>
          Object.keys(original_data).every(
            (key) => m[key] === original_data[key]
          )
            ? { ...m, ...meta_data }
            : m
        );

        const result = await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].members": updatedMembers } },
          { arrayFilters: [{ "elem.category": category }] }
        );

        if (result.modifiedCount === 0) {
          return { success: false, error: "No changes detected" };
        }
      }

      /* -------- gallery -------- */
      if (collection_type === "gallery") {
        if (!original_data) {
          return { success: false, error: "original_data required" };
        }

        const originalPaths = Array.isArray(original_data)
          ? original_data
          : [original_data];

        const newPaths = Array.isArray(meta_data)
          ? meta_data
          : [meta_data];

        const updatedPaths = categoryExists.image_path.map((p) =>
          originalPaths.includes(p)
            ? newPaths[originalPaths.indexOf(p)] || p
            : p
        );

        const result = await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $set: { "data.$.image_path": updatedPaths } }
        );

        if (result.modifiedCount === 0) {
          return { success: false, error: "No changes detected" };
        }
      }

      return {
        success: true,
        message: `Updated successfully in ${collection_type} - ${category}`,
        data: meta_data,
      };
    }

    return { success: false, error: "No matching update case found" };
  } catch (err) {
    console.error("❌ Error updating data:", err);
    return {
      success: false,
      error: "Internal server error",
      details: err.message,
    };
  }
}

module.exports = { updateData };
