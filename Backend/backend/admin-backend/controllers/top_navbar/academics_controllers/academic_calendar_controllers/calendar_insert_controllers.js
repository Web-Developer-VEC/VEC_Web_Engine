async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection type and meta data are required");
    }

    if (collection_type !== "academic_calendar") {
      throw new Error("Invalid collection type");
    }

    // Fetch the academic_calendar document
    const mainDoc = await mainCollection.findOne({ type: "academic_calendar" });
    if (!mainDoc) throw new Error("Academic calendar document not found");

    // Check if year already exists
    const existingYearIndex = mainDoc.data.findIndex(
      (item) => item.year === meta_data.year
    );

    if (existingYearIndex !== -1) {
      // Year exists → append pdf_path, avoid duplicates
      const existingPdfPaths = mainDoc.data[existingYearIndex].pdf_path || [];
      const newPdfPaths = meta_data.pdf_path.filter(
        (pdf) => !existingPdfPaths.includes(pdf)
      );

      if (newPdfPaths.length > 0) {
        await mainCollection.updateOne(
          { type: "academic_calendar", "data.year": meta_data.year },
          { $push: { "data.$.pdf_path": { $each: newPdfPaths } } }
        );
      }

      return { message: `PDF path(s) appended to existing year ${meta_data.year}` };
    } else {
      // Year does not exist → insert new object
      await mainCollection.updateOne(
        { type: "academic_calendar" },
        { $push: { data: meta_data } }
      );

      return { message: `New academic calendar for year ${meta_data.year} inserted` };
    }

  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Internal server error");
  }
}

module.exports = { insertData };
