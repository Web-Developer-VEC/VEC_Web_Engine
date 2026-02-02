async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("collection_type, meta_data, and original_data are required");
    }

    if (collection_type !== "academic_calendar") {
      throw new Error("Invalid collection type");
    }

    const { year: newYear, pdf_path: newPdfPaths } = meta_data;
    const { year: origYear, pdf_path: origPdfPaths } = original_data;

    if (!newYear || !Array.isArray(newPdfPaths) || !origYear || !Array.isArray(origPdfPaths)) {
      throw new Error("Year and pdf_path arrays are required in meta_data and original_data");
    }

    // Validate year formats
    const yearRegex = /^Academic Year \d{4}-\d{4}$/;
    if (!yearRegex.test(newYear) || !yearRegex.test(origYear)) {
      throw new Error("Years must be in format 'Academic Year YYYY-YYYY'");
    }

    // Validate PDF paths
    newPdfPaths.forEach(path => {
      if (typeof path !== "string" || !path.startsWith("/static/pdfs/")) {
        throw new Error(`Invalid PDF path in meta_data: ${path}`);
      }
    });
    origPdfPaths.forEach(path => {
      if (typeof path !== "string" || !path.startsWith("/static/pdfs/")) {
        throw new Error(`Invalid PDF path in original_data: ${path}`);
      }
    });

    // Fetch main collection document
    const mainDoc = await mainCollection.findOne({ type: "academic_calendar" });
    if (!mainDoc) throw new Error("Main collection document not found");

    const yearEntry = mainDoc.data.find(d => d.year === origYear);
    if (!yearEntry) throw new Error(`Original year ${origYear} not found`);

    // Map and update PDFs: Replace matching originals with new ones
    let updatedPdfPaths = [...yearEntry.pdf_path];
    origPdfPaths.forEach((origPdf, index) => {
      const matchIndex = updatedPdfPaths.indexOf(origPdf);
      if (matchIndex !== -1 && newPdfPaths[index]) {
        updatedPdfPaths[matchIndex] = newPdfPaths[index];
      }
    });

    // Prepare update fields
    const updateFields = {};
    if (origYear !== newYear) {
      updateFields["data.$[elem].year"] = newYear;
    }
    updateFields["data.$[elem].pdf_path"] = updatedPdfPaths;

    await mainCollection.updateOne(
      { type: "academic_calendar" },
      { $set: updateFields },
      { arrayFilters: [{ "elem.year": origYear }] }
    );

    return { success: true, message: "Academic calendar updated successfully" };

  } catch (error) {
    console.error("Update error:", error);
    throw new Error(error.message || "Internal server error");
  }
}

module.exports = { updateData };