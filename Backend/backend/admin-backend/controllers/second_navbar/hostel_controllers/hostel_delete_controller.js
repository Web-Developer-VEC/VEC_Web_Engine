// ------------------- DELETE -------------------
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Type not found");

    // ---------- HOSTEL FACILITIES ----------
    if (collection_type === "hostel_facilities") {
      const updatedData = doc.data.filter(
        (item) =>
          !Object.keys(meta_data).every((k) => item[k] === meta_data[k])
      );

      await mainCollection.updateOne(
        { type: "hostel_facilities" },
        { $set: { data: updatedData } }
      );

      return {
        success: true,
        message: "Hostel facility deleted successfully",
        data: updatedData,
      };
    }

    // ---------- WARDEN ----------
    if (collection_type === "warden") {
      if (!category) throw new Error("Category required for warden");

      const catIndex = doc.data.findIndex((c) => c.category === category);
      if (catIndex === -1) throw new Error("Category not found");

      doc.data[catIndex].members = doc.data[catIndex].members.filter(
        (m) => {
          console.log("War ", m);

          return !Object.keys(meta_data).every((k) => {
            console.log(m[k]," => ",meta_data[k]);
            
            return m[k] === meta_data[k]
          })
        }
      );
      await mainCollection.updateOne(
        { type: "warden" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Warden deleted successfully" };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

module.exports = { deleteData };
