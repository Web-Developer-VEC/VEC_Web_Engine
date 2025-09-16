// ------------------- UPDATE (RESEARCH) -------------------
async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Type, meta_data, and original_data required");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document of this type not found");

    // ---------- JOURNAL PUBLICATION ----------
    if (collection_type === "Journal Publication") {
      const index = doc.data.findIndex((item) => item.year === original_data.year);
      if (index === -1) throw new Error("Year not found in Journal Publication");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "Journal Publication" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Journal Publication updated successfully", data: doc.data[index] };
    }

    // ---------- FUNDED PROJECTS ----------
    if (collection_type === "Funded Projects") {
      const index = doc.data.findIndex((item) => item.year === original_data.year);
      if (index === -1) throw new Error("Year not found in Funded Projects");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "Funded Projects" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Funded Projects updated successfully", data: doc.data[index] };
    }

    // ---------- CONSULTANCY ----------
    if (collection_type === "Consultancy") {
      const index = doc.data.findIndex((item) => item.year === original_data.year);
      if (index === -1) throw new Error("Year not found in Consultancy");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "Consultancy" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Consultancy updated successfully", data: doc.data[index] };
    }

    // ---------- BOOKS AND BOOK CHAPTERS ----------
    if (collection_type === "Books and Book chapters") {
      const index = doc.data.findIndex((item) => item.year === original_data.year);
      if (index === -1) throw new Error("Year not found in Books and Book chapters");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "Books and Book chapters" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Books and Book chapters updated successfully", data: doc.data[index] };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { updateData };
