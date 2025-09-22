async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;

    // 1️⃣ Validate required fields
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    // 2️⃣ Fetch the document for this collection_type
    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document not found");
    if (!doc.data) throw new Error("Document has no data field");

    // Debug
    console.log("🔎 Incoming update request:", {
      collection_type,
      category,
      original_data,
      meta_data,
    });

    // 3️⃣ Define type categories
    const singleCategoryTypes = ["about_the_department", "department_vision","department_mission"];
    const categoryBasedTypes = ["programme_educational_objectives","program_outcomes","program_specific_outcomes"];
   
    // 4️⃣ Single-doc types → overwrite entire data array
    if (singleCategoryTypes.includes(category)) {
        const new_data = Array.isArray(meta_data)?meta_data:[meta_data]
      const result = await mainCollection.updateOne(
        { type: "vision_and_mission", "data.category": category },
        { $set: { "data.$.content": new_data } }
      );

      if (result.modifiedCount === 0) {
        return { success: false, error: `No matching category found for ${collection_type}` };
      }

      return {
        success: true,
        message: `Updated successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 5️⃣ Category-based
    if (categoryBasedTypes.includes(category)) {
      if (!category) return { success: false, error: "category is required" };

      
      await mainCollection.updateOne(
        { type: collection_type,"data.category":category },
        { $set: { "data.$[elem].content.$[con]": meta_data } },
        { arrayFilters: [{ "elem.category": category },{"con.header":original_data.header}] }
      );

      return {
        success: true,
        message: `Updated successfully in ${collection_type} - category ${category}`,
        data: meta_data,
      };
    }

    //  No matching case found
    throw new Error("No matching case found");

  } catch (error) {
    console.error("Error updating data:", error);
    return { success: false, error: error.message };  // ✅ show actual reason
  }
}

module.exports = { updateData };
