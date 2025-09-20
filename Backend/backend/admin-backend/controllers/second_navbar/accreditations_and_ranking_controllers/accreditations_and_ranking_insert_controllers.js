async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    const singleObjects = ["qs_rating"];
    const multipleObjects = ["nba"];
    const categoryObjects = ["naac", "nirf"];

    // ===================== NBA =====================
    if (multipleObjects.includes(collection_type)) {
      if (!doc)
        throw new Error(
          "Document with the specified collection_type not found"
        );

      const items = Array.isArray(meta_data) ? meta_data : [meta_data];

      for (const item of items) {
        const dept = doc.data.find((d) => d.id === item.id);

        if (dept) {
          // Add new PDFs to existing department
          if (item.pdfs && item.pdfs.length > 0) {
            await mainCollection.updateOne(
              { type: collection_type, "data.id": item.id },
              { $push: { "data.$.pdfs": { $each: item.pdfs } } }
            );
          }
        } else {
          // Insert new department
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: item } }
          );
        }
      }

      return {
        success: true,
        message: "NBA data inserted/updated successfully",
      };
    }

    // ===================== QS Rating =====================
    if (singleObjects.includes(collection_type)) {
      const newData = Array.isArray(meta_data) ? meta_data : [meta_data];
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: newData } }
      );

      return {
        success: true,
        message: `Data inserted successfully in ${collection_type}`,
      };
    }

    // ===================== NAAC / NIRF =====================
    if (categoryObjects.includes(collection_type)) {
      // Check if category exists
      const categoryExist = doc.data.find((c) => c.category === category);

      // ---------- NAAC ----------
      if (collection_type === "naac") {
        if (categoryExist) {
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $push: { "data.$.content": meta_data } }
          );
        } else {
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { category, content: [meta_data] } } }
          );
        }

        return {
          success: true,
          message: "NAAC data inserted/updated successfully",
        };
      }

      // ---------- NIRF ----------
      if (collection_type === "nirf") {
        if (categoryExist) {
          // Check if year exists within this category
          const yearExist =
            categoryExist && categoryExist.year === meta_data.year
              ? categoryExist
              : null;

          if (yearExist) {
            // Push new content into existing year
            await mainCollection.updateOne(
              {
                type: collection_type,
                "data.category": category,
                "data.year": meta_data.year,
              },
              { $push: { "data.$.content": { $each: meta_data.content } } }
            );
          } else {
            // Insert new year object under category
            await mainCollection.updateOne(
              { type: collection_type, "data.category": category },
              {
                $push: {
                  "data.$.year": {
                    year: meta_data.year,
                    content: meta_data.content,
                  },
                },
              }
            );
          }
        } else {
          // Insert new category with year and content
          await mainCollection.updateOne(
            { type: collection_type },
            {
              $push: {
                data: {
                  category,
                  year: meta_data.year,
                  content: meta_data.content,
                },
              },
            }
          );
        }

        return {
          success: true,
          message: "NIRF data inserted/updated successfully",
        };
      }
    }

    throw new Error("Invalid collection_type");
  } catch (error) {
    console.error("Error in insertData:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { insertData };
