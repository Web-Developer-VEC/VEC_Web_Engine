async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection type and meta data are required");
    }

    if (collection_type !== "academic_calendar") {
      throw new Error("Invalid collection type");
    }

    const { year, pdf_path } = meta_data;

    if (!year || !Array.isArray(pdf_path)) {
      throw new Error("Year and pdf_path array are required in meta_data");
    }

    // Validate year format
    const yearRegex = /^Academic Year \d{4}-\d{4}$/;
    if (!yearRegex.test(year)) {
      throw new Error("Year must be in format 'Academic Year YYYY-YYYY'");
    }

    // Validate PDF paths
    pdf_path.forEach(path => {
      if (typeof path !== "string") {
        throw new Error(`Invalid PDF path: ${path}`);
      }
    });

    // Fetch the academic_calendar document
    const mainDoc = await mainCollection.findOne({ type: "academic_calendar" });
    if (!mainDoc) throw new Error("Academic calendar document not found");

    // Check if year already exists
    const existingYearIndex = mainDoc.data.findIndex(
      (item) => item.year === year
    );

    if (existingYearIndex !== -1) {
      // Year exists → append pdf_path, avoid duplicates
      const existingPdfPaths = mainDoc.data[existingYearIndex].pdf_path || [];
      const newPdfPaths = pdf_path.filter(
        (pdf) => !existingPdfPaths.includes(pdf)
      );

      if (newPdfPaths.length > 0) {
        await mainCollection.updateOne(
          { type: "academic_calendar", "data.year": year },
          { $push: { "data.$.pdf_path": { $each: newPdfPaths } } }
        );
        return { success: true, message: `PDF path(s) appended to existing year ${year}` };
      } else {
        return { success: true, message: "No new PDFs to append (duplicates avoided)" };
      }
    } else {
      // Year does not exist → insert new object
      await mainCollection.updateOne(
        { type: "academic_calendar" },
        { $push: { data: meta_data } }
      );

      return { success: true, message: `New academic calendar for year ${year} inserted` };
    }

  } catch (error) {
    console.error("Insert error:", error);
    throw new Error(error.message || "Internal server error");
  }
}

module.exports = { insertData };