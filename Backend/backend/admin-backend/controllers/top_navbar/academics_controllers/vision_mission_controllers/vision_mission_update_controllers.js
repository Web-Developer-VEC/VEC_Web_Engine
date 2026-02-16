async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;

    // ==============================
    // 1️⃣ Basic Validation
    // ==============================
    if (!collection_type || !meta_data || !category) {
      throw new Error("collection_type, category and meta_data are required");
    }

    // ==============================
    // 2️⃣ Check Document Exists
    // ==============================
    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document not found");
    if (!doc.data) throw new Error("Document has no data field");

    console.log("🔎 Incoming update request:", {
      collection_type,
      category,
      original_data,
      meta_data,
    });

    // ==============================
    // 3️⃣ Category Types
    // ==============================
    const singleCategoryTypes = [
      "about_the_department",
      "department_vision",
      "department_mission"
    ];

    const objectCategoryTypes = [
      "programme_educational_objectives",
      "program_outcomes",
      "program_specific_outcomes"
    ];

    // =====================================================
    // ✅ CASE 1: STRING ARRAY CATEGORIES
    // =====================================================
    if (singleCategoryTypes.includes(category)) {

      let new_data;

      // If already correct array
      if (Array.isArray(meta_data)) {
        new_data = meta_data;
      }
      // If frontend sends { "0": "text" }
      else if (typeof meta_data === "object") {
        new_data = Object.values(meta_data);
      }
      // If single string
      else if (typeof meta_data === "string") {
        new_data = [meta_data];
      }
      else {
        throw new Error("Invalid meta_data format for string category");
      }

      const result = await mainCollection.updateOne(
        { type: collection_type, "data.category": category },
        { $set: { "data.$.content": new_data } }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: `No matching category found for ${category}` };
      }

      return {
        success: true,
        message: `Updated successfully for ${category}`,
        data: new_data,
      };
    }

    // =====================================================
    // ✅ CASE 2: OBJECT ARRAY CATEGORIES (PEO, PO, PSO)
    // =====================================================
    if (objectCategoryTypes.includes(category)) {

      if (!original_data?.header) {
        throw new Error("original_data.header is required for this category");
      }

      if (!meta_data?.header || !meta_data?.content) {
        throw new Error("meta_data must contain header and content");
      }

      const result = await mainCollection.updateOne(
        { type: collection_type },
        {
          $set: {
            "data.$[elem].content.$[con]": meta_data
          }
        },
        {
          arrayFilters: [
            { "elem.category": category },
            { "con.header": original_data.header }
          ]
        }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: "No matching header found" };
      }

      return {
        success: true,
        message: `Updated successfully in ${category}`,
        data: meta_data,
      };
    }

    // =====================================================
    // ❌ No Matching Category
    // =====================================================
    throw new Error("No matching category type found");

  } catch (error) {
    console.error("❌ Error updating data:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { updateData };
