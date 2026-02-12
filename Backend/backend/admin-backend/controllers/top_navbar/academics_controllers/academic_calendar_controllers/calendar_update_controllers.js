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
    const { year: origYear } = original_data;

    if (!newYear || !origYear || !Array.isArray(newPdfPaths)) {
      throw new Error("year and pdf_path array are required");
    }

    const yearRegex = /^Academic Year \d{4}-\d{4}$/;
    if (!yearRegex.test(newYear) || !yearRegex.test(origYear)) {
      throw new Error("Invalid year format");
    }

    newPdfPaths.forEach(p => {
      if (typeof p !== "string" || !p.startsWith("/static/pdfs/")) {
        throw new Error(`Invalid PDF path: ${p}`);
      }
    });

    const result = await mainCollection.updateOne(
      {
        type: "academic_calendar",
        "data.year": origYear
      },
      {
        $set: {
          "data.$.year": newYear,
          "data.$.pdf_path": newPdfPaths
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error(`Academic year ${origYear} not found`);
    }

    return { success: true, message: "Academic calendar updated successfully" };

  } catch (error) {
    console.error("Update error:", error);
    throw new Error(error.message);
  }
}


module.exports = { updateData };