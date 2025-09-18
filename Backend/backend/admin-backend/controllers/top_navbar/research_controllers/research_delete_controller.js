// ------------------- DELETE -------------------
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and originalData required for delete");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document of this type not found");

    // ---------- JOURNAL PUBLICATION ----------
    if (collection_type === "Journal Publication") {
      const index = doc.data.findIndex(
        (item) => item.year === meta_data.year
      );
      if (index === -1) throw new Error("Year not found in Journal Publication");

      doc.data.splice(index, 1);

      await mainCollection.updateOne(
        { type: "Journal Publication" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Journal Publication entry deleted successfully" };
    }

    // ---------- FUNDED PROJECTS ----------
    if (collection_type === "Funded Projects") {
      const index = doc.data.findIndex(
        (item) => item.year === meta_data.year
      );
      if (index === -1) throw new Error("Year not found in Funded Projects");

      doc.data.splice(index, 1);

      await mainCollection.updateOne(
        { type: "Funded Projects" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Funded Project entry deleted successfully" };
    }

    // ---------- CONSULTANCY ----------
    if (collection_type === "Consultancy") {
      const index = doc.data.findIndex(
        (item) => item.year === meta_data.year
      );
      if (index === -1) throw new Error("Year not found in Consultancy");

      doc.data.splice(index, 1);

      await mainCollection.updateOne(
        { type: "Consultancy" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Consultancy entry deleted successfully" };
    }

    // ---------- BOOKS AND BOOK CHAPTERS ----------
    if (collection_type === "Books and Book chapters") {
      const index = doc.data.findIndex(
        (item) => item.year === meta_data.year
      );
      if (index === -1) throw new Error("Year not found in Books and Book chapters");

      doc.data.splice(index, 1);

      await mainCollection.updateOne(
        { type: "Books and Book chapters" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Books and Book chapters entry deleted successfully" };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ let the controller handle response
  }
}

module.exports = { deleteData };
