async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }
    if (collection_type !== "vision_and_mission") {
      throw new Error("Incorrect collection type or route");
    }

    const categoryBasedTypes = ["vision_and_mission"];

    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) throw new Error("category is required");

      const doc = await mainCollection.findOne({ type: collection_type });

      // normalize incoming items
      let newItems = Array.isArray(meta_data?.content)
        ? meta_data.content
        : [meta_data.content || meta_data];

      // 🔑 check if this category needs structured objects (header + content)
      const structuredCategories = [
        "programme_educational_objectives",
        "program_outcomes",
        "program_specific_outcomes",
      ];

      if (structuredCategories.includes(category)) {
        // auto-generate headers based on existing length
        const existingCategory = doc?.data.find((c) => c.category === category);
        const existingLength = existingCategory?.content?.length || 0;

        newItems = newItems.map((item, idx) => {
          if (typeof item === "string") {
            return {
              header: `PEO ${existingLength + idx + 1}`,
              content: item,
            };
          }
          return item; // already an object
        });
      }

      if (doc) {
        const categoryExists = doc.data.find((c) => c.category === category);

        if (categoryExists) {
          // Append to existing content
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $push: { "data.$.content": { $each: newItems } } }
          );
        } else {
          // Add new category into existing document
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { category, content: newItems } } }
          );
        }
      } else {
        // Create new document
        await mainCollection.insertOne({
          type: collection_type,
          data: [{ category, content: newItems }],
        });
      }

      return {
        success:true, 
        message: `Insert successful for ${collection_type} - category ${category}`,
        data: newItems,
      };
    }

    return {
      success:true, 
      message: `Insert successful for ${collection_type} - category ${category}`,
      data: meta_data,
    };
  } catch (error) {
    console.error("❌ Error inserting vision_and_mission data:", error);
    return {
      success:false, 
      message: "Server error",
      details: error.message,
    };
  }
}

module.exports = { insertData };
