async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Missing required fields: collection_type, category, or meta_data");
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    const singleDocTypes = [
      "about_trust",
      "vision_and_mission",
      "Management",
      "contact_us",
    ];

    const categoryBasedtypes = ["AISHE"];

    if (!doc) {
      throw new Error(`Document with type ${collection_type} not found`);
    }

    // ---------- ABOUT VEC ----------
    if (collection_type === "about_vec") {
      await mainCollection.updateOne(
        { type: "about_vec" },
        { $push: { "data.about_us_pdf": meta_data } }
      );

      return { success:true, message: "The data is inserted into about_vec pdf links" };
    }

    // ---------- SINGLE DOC TYPES ----------
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: meta_data } }
      );
      return { success:true, message: `Inserted data into ${collection_type}` };
    }

    // ---------- AISHE (FIXED) ----------
    if (categoryBasedtypes.includes(collection_type)) {
      if (!category) {
        throw new Error("Category is required for AISHE");
      }

      const existingCategory = doc.data.find(d => d.category === category);

      // ✅ Category exists → push into content[]
      if (existingCategory) {

  const result = await mainCollection.updateOne(
    { type: "AISHE" },
    {
      $set: {
        "data.$[cat].content.$[item].pdf_path": meta_data.pdf_path
      }
    },
    {
      arrayFilters: [
        { "cat.category": category },
        { "item.name": meta_data.name }
      ]
    }
  );

  if (result.modifiedCount === 0) {
    throw new Error("AISHE item not found");
  }

  return {
    success: true,
    message: "AISHE PDF updated successfully"
  };
}

    await mainCollection.updateOne(
      { type: "AISHE" },
      {
        $push: {
          data: {
              category: meta_data.category,
              content: meta_data.content
          }
        }
      }
    );

      return { success:true, message: `Inserted new AISHE category ${category}` };
    }
  } catch (error) {
    throw new Error(`Error inserting data: ${error.message}`);
  }
}

module.exports = { insertData };
