async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;
    const department_name = meta_data?.department_name;

    if (!collection_type) {
      return { success: false, error: "collection_type is required" };
    }

    /* -------------------------------------------------
       TYPE GROUPS
    ------------------------------------------------- */
    const singleObjectTypes = ["objectives"];

    const multiDocTypes = [
      "coordinator",
      "strategic_plan",
      "institutional_distinctiveness",
      "code_of_ethics",
      "aqar",
      "iso_certificate",
      "best_practices",
      "minutes_of_meetings",
    ];

    const categoryBasedTypes = ["members", "gallery"];
    const departmentBasedTypes = ["academic_admin_audit"];

    /* -------------------------------------------------
       1️⃣ SINGLE OBJECT TYPES
    ------------------------------------------------- */
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

      return {
        success: true,
        message: `Deleted specified fields for ${collection_type}`,
        data: updatedData,
      };
    }

    /* -------------------------------------------------
       2️⃣ MULTI DOC TYPES
    ------------------------------------------------- */
    if (multiDocTypes.includes(collection_type)) {
      if (!meta_data || Object.keys(meta_data).length === 0) {
        return {
          success: false,
          error: "meta_data required to delete specific item",
        };
      }

      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: meta_data } }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: "No matching item found to delete" };
      }

      return {
        success: true,
        message: `Deleted one document from ${collection_type}`,
        deleted: meta_data,
      };
    }

    /* -------------------------------------------------
       3️⃣ CATEGORY BASED (MEMBERS / GALLERY)
    ------------------------------------------------- */
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) {
        return { success: false, error: "category is required" };
      }

      const doc = await mainCollection.findOne({ type: collection_type });
      const categoryExists = doc?.data?.find((c) => c.category === category);

      if (!categoryExists) {
        return {
          success: false,
          error: `Category ${category} not found`,
        };
      }

      /* -------- MEMBERS -------- */
      if (collection_type === "members") {
        if (!meta_data || !Array.isArray(meta_data.members)) {
          // delete entire category
          await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { data: { category } } }
          );
          return { success: true, message: "Category deleted successfully" };
        }

        const namesToDelete = meta_data.members.map((m) => m.name);

        const result = await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          {
            $pull: {
              "data.$.members": { name: { $in: namesToDelete } },
            },
          }
        );

        if (result.modifiedCount === 0) {
          return { success: false, error: "No members deleted" };
        }

        return { success: true, message: "Member(s) deleted successfully" };
      }

      /* -------- GALLERY -------- */
      if (collection_type === "gallery") {
        if (!meta_data || !Array.isArray(meta_data.image_path)) {
          await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { data: { category } } }
          );
          return { success: true, message: "Gallery category deleted" };
        }

        const result = await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          {
            $pull: {
              "data.$.image_path": { $in: meta_data.image_path },
            },
          }
        );

        if (result.modifiedCount === 0) {
          return { success: false, error: "No images deleted" };
        }

        return {
          success: true,
          message: `Images deleted from ${category}`,
        };
      }
    }

    /* -------------------------------------------------
       4️⃣ DEPARTMENT BASED (ACADEMIC ADMIN AUDIT)
    ------------------------------------------------- */
    if (departmentBasedTypes.includes(collection_type)) {
      if (!department_name) {
        return { success: false, error: "Department name is required" };
      }

      const doc = await mainCollection.findOne({ type: collection_type });
      if (!doc || !Array.isArray(doc.data)) {
        return { success: false, error: "Document not found" };
      }

      const departmentExists = doc.data.find(
        (d) => d.department_name === department_name
      );

      if (!departmentExists) {
        return {
          success: false,
          error: `Department ${department_name} not found`,
        };
      }

      /* ---- CASE 1: year empty → delete whole department ---- */
      if (!meta_data.year || meta_data.year.length === 0) {
        const result = await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { department_name } } }
        );

        if (result.modifiedCount === 0) {
          return {
            success: false,
            error: "No department deleted",
          };
        }

        return {
          success: true,
          message: `Department ${department_name} deleted successfully`,
        };
      }

      /* ---- CASE 2: delete specific years ---- */
      const yearsToDelete = Array.isArray(meta_data.year)
        ? meta_data.year
        : [meta_data.year];

      const updatedYears = [];
      const updatedPdfPaths = [];

      for (let i = 0; i < departmentExists.year.length; i++) {
        if (!yearsToDelete.includes(departmentExists.year[i])) {
          updatedYears.push(departmentExists.year[i]);
          updatedPdfPaths.push(departmentExists.pdf_path[i]);
        }
      }

      const result = await mainCollection.updateOne(
        { type: collection_type, "data.department_name": department_name },
        {
          $set: {
            "data.$.year": updatedYears,
            "data.$.pdf_path": updatedPdfPaths,
          },
        }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: "No data deleted" };
      }

      return {
        success: true,
        message: `Deleted specified years for ${department_name}`,
      };
    }

    return { success: false, error: "Invalid delete request" };
  } catch (error) {
    console.error("❌ Error deleting data:", error);
    return {
      success: false,
      error: "Internal server error",
      details: error.message,
    };
  }
}

module.exports = { deleteData };
