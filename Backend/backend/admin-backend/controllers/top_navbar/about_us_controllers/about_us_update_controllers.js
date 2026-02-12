async function updatedData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Missing required fields");
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
      // ---------- CONTENT ----------
      if (category === "content") {

        await mainCollection.updateOne(
          { type: "about_vec" },
          { $set: { "data.content": meta_data } }
        );

        return { message: "Content updated successfully" };
      }

      // ---------- PDF ----------
      if (category === "about_us_pdf") {

        const result = await mainCollection.updateOne(
          {
            type: "about_vec",
            "data.about_us_pdf.name": original_data.name,
          },
          {
            $set: {
              "data.about_us_pdf.$": meta_data,
            },
          }
        );

        if (result.matchedCount === 0) {
          throw new Error(`PDF "${original_data.name}" not found`);
        }
        return { message: "PDF updated successfully" };
      }
    }

    // ---------- SINGLE DOC TYPES ----------
    if (singleDocTypes.includes(collection_type)) {
      const updateFields = {};
      Object.keys(meta_data).forEach(key => {
        updateFields[`data.${key}`] = meta_data[key];
      });

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: updateFields }
      );

      return { message: `Updated ${collection_type}` };
    }

    // ---------- AISHE (FIXED) ----------
    if (categoryBasedtypes.includes(collection_type)) {
      if (!category) {
        throw new Error("Category is required for AISHE");
      }

      const result = await mainCollection.updateOne(
        {
          type: "AISHE",
          "data.category": category,
          "data.content.name": original_data.name,
        },
        {
          $set: {
            "data.$[cat].content.$[item]": {
              ...original_data,
              ...meta_data,
            },
          },
        },
        {
          arrayFilters: [
            { "cat.category": category },
            { "item.name": original_data.name },
          ],
        }
      );

      if (result.matchedCount === 0) {
        throw new Error("AISHE item not found for update");
      }

      return { message: `AISHE item updated in ${category}` };
    }
  } catch (error) {
    throw new Error(`Error updating data: ${error.message}`);
  }
}

module.exports = { updatedData };
