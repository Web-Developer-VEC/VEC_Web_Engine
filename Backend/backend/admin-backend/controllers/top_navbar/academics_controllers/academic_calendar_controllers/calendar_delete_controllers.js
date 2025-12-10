async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    if (collection_type !== "academic_calendar") {
      throw new Error("Invalid collection type");
    }

    const { year, pdf_path } = meta_data;

    if (!year) throw new Error("Year is required in meta_data");

    const mainDoc = await mainCollection.findOne({ type: "academic_calendar" });
    if (!mainDoc) throw new Error("Academic calendar document not found");

    const yearEntry = mainDoc.data.find(d => d.year === year);
    if (!yearEntry) return { message: "Year not found, nothing deleted" };

    // Case: pdf_path is empty string → remove all PDFs
    if (pdf_path === "") {
      await mainCollection.updateOne(
        { type: "academic_calendar", "data.year": year },
        { $set: { "data.$.pdf_path": [] } }
      );
      return { message: `All PDFs removed for year ${year}` };
    }

    // Case: pdf_path contains array → remove specific PDFs
    if (Array.isArray(pdf_path) && pdf_path.length > 0) {
      await mainCollection.updateOne(
        { type: "academic_calendar", "data.year": year },
        { $pull: { "data.$.pdf_path": { $in: pdf_path } } }
      );
      return { message: `Specified PDFs deleted for year ${year}` };
    }

    // Case: Only year key, no pdf_path → delete entire object
    if (!pdf_path) {
      await mainCollection.updateOne(
        { type: "academic_calendar" },
        { $pull: { data: { year: year } } }
      );
      return { message: `Academic calendar for year ${year} deleted` };
    }

  } catch (error) {
    console.error(error);
    throw new Error(error.message || "Internal server error");
  }
}

module.exports = { deleteData };
