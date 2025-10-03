async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("collection_type, meta_data, and original_data are required");
    }

    if (collection_type !== "academic_calendar") {
      throw new Error("Invalid collection type");
    }

    // Fetch main collection document (simulate, replace with DB query)
    const mainDoc = await mainCollection.findOne({ type: "academic_calendar" });
    if (!mainDoc) throw new Error("Main collection document not found");

    const mainPdfPaths = mainDoc.data.find(d => d.year === original_data.year)?.pdf_path || [];

    // Map original_data to main collection and update with meta_data
    const updatedPdfPaths = mainPdfPaths.map((mainPdf) => {
      const indexInOriginal = original_data.pdf_path.indexOf(mainPdf);
      if (indexInOriginal !== -1) {
        return meta_data.pdf_path[indexInOriginal] !== undefined
          ? meta_data.pdf_path[indexInOriginal]
          : mainPdf;
      }
      return mainPdf; // keep unchanged if not in original_data
    });

    // Prepare update fields
    const updateFields = {};
    if (original_data.year !== meta_data.year) {
      updateFields["data.$[elem].year"] = meta_data.year;
      updateFields["data.$[elem].pdf_path"] = updatedPdfPaths;
    }
    if (JSON.stringify(updatedPdfPaths) !== JSON.stringify(mainPdfPaths)) {
      updateFields["data.$[elem].pdf_path"] = updatedPdfPaths;
    }

    if (Object.keys(updateFields).length > 0) {
      await mainCollection.updateOne(
        { type: "academic_calendar" },
        { $set: updateFields },
        { arrayFilters: [{ "elem.year": original_data.year }] }
      );
      return { message: "Academic calendar updated successfully" };
    }

    return { message: "No changes detected" };

  } catch (error) {
    throw new Error(error.message || "Internal server error");
  }
}

module.exports = { updateData };
