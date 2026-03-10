async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error(
        "collection_type, meta_data, and original_data are required"
      );
    }

    // ========== 1. NBA ==========
    if (collection_type === "nba") {
      for (let i = 0; i < meta_data.pdfs.length; i++) {
        const pdf = meta_data.pdfs[i];
        const oldPdf = original_data.pdfs[i];

        await mainCollection.updateOne(
          { type: collection_type, "data.id": original_data.id },
          {
            $set: {
              "data.$.pdfs.$[con]": pdf,
            },
          },
          { arrayFilters: [{ "con.name": oldPdf.name }] }
        );
      }

      return { success: true,  message: "NBA department updated successfully" };
    }

    // ========== 2. QS Rating ==========
    if (collection_type === "qs_rating") {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: [meta_data] } } // always overwrite with new certificate
      );

      return { success: true,  message: "QS rating updated successfully" };
    }

    // ========== 3. NAAC ==========
    if (collection_type === "naac") {
      await mainCollection.updateOne(
        { type: collection_type, "data.category": category },
        {
          $set: {
            "data.$.content.$[con]": meta_data,
          },
        },
        { arrayFilters: [{ "con.name": original_data.name }] }
      );

      return { success: true,  message: "NAAC category updated successfully" };
    }

    // ========== 4. NIRF ==========
    if (collection_type === "nirf") {
      for (let i = 0; i < meta_data.content.length; i++) {
        const newContent = meta_data.content[i];
        const oldContent = original_data.content[i];

        await mainCollection.updateOne(
          {
            type: collection_type,
            "data.category": category,
            "data.year": original_data.year,
          },
          {
            $set: {
              "data.$.content.$[con]": newContent,
            },
          },
          {
            arrayFilters: [{ "con.name": oldContent.name }],
          }
        );
      }

      return { success: true,  message: "NIRF year data updated successfully" };
    }

    // ---------- FALLBACK ----------
    throw new Error("Invalid collection_type for update");
  } catch (error) {
    console.error("Error in updateData:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { updateData };
