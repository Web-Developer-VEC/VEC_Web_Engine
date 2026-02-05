// ------------------- DELETE -------------------
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and originalData required for delete");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    const collections = ["Journal Publication", "Funded Projects", "Consultancy", "Books and Book chapters", "Policy"]
    if (!doc) throw new Error("Document of this type not found");

    // ---------- JOURNAL PUBLICATION ----------
    if (collections.includes(collection_type)) {
      let index = doc.data.findIndex(
        (item) => item.year === meta_data.year
      );
      if (collection_type === "Policy") index = doc.data.findIndex((item) => item.name === meta_data.name);
      if (index === -1) throw new Error(`${collection_type == "Policy" ? "Policy" : "Year"} not found in ${collection_type}`);


      doc.data.splice(index, 1);

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data } }
      );

      return { success: true, message: `${collection_type} updated successfully`, data: doc.data[index] };

    }


    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ let the controller handle response
  }
}

module.exports = { deleteData };
