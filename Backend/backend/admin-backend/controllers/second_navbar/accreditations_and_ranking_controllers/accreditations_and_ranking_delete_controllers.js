async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    // ========== 1. NBA ==========
    if (collection_type === "nba") {
      const doc = await mainCollection.findOne({ type: collection_type });
      const deptExist = doc.data.find((d) => d.id === meta_data.id);
      if (!deptExist) return { message: "Department not found" };

      if (Array.isArray(meta_data.pdfs) && meta_data.pdfs.length > 0) {
        // Delete specific PDFs
        for (const pdf of meta_data.pdfs) {
          await mainCollection.updateOne(
            { type: collection_type, "data.id": meta_data.id },
            { $pull: { "data.$.pdfs": { name: pdf.name } } }
          );
        }
        return { message: `Selected PDFs deleted in ${meta_data.department}` };
      } else {
        // Delete entire department
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { id: meta_data.id } } }
        );
        return { message: `Entire department ${meta_data.department} deleted` };
      }
    }

    // ========== 2. NAAC ==========
    if (collection_type === "naac") {
      if (meta_data && meta_data.name) {
        // Delete single PDF
        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $pull: { "data.$.content": { name: meta_data.name } } }
        );
        return { message: "NAAC content deleted successfully" };
      } else {
        // Delete entire category
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category } } }
        );
        return { message: `Entire NAAC category '${category}' deleted` };
      }
    }

    // ========== 3. NIRF ==========
    if (collection_type === "nirf") {
      const yearExist = meta_data && meta_data.year;
      if (!yearExist) {
        // Delete entire category
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category } } }
        );
        return { message: `Entire NIRF category '${category}' deleted` };
      }

      if (meta_data.content && meta_data.content.length > 0) {
        // Delete specific PDFs in the year
        for (const pdf of meta_data.content) {
          await mainCollection.updateOne(
            {
              type: collection_type,
              "data.category": category,
              "data.year": meta_data.year,
            },
            { $pull: { "data.$.content": { name: pdf.name } } }
          );
        }
        return { message: `Selected PDFs deleted in NIRF ${category} ${meta_data.year}` };
      } else {
        // Delete entire year
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category, year: meta_data.year } } }
        );
        return { message: `Entire NIRF year ${meta_data.year} deleted` };
      }
    }

    throw new Error("Invalid collection_type for delete");
  } catch (error) {
    console.error("Error in deleteData:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { deleteData };
