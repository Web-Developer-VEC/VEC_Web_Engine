// // ------------------- DELETE -------------------
async function deleteData(req, res, tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data)
      return res.status(400).json({ error: "Type and data required" });

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) return res.status(404).json({ error: "Type not found" });

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

      return res.json({
        message: "Hostel facility deleted successfully",
        data: updatedData,
      });
    }

    // ---------- WARDEN ----------
    if (collection_type === "warden") {
      if (!category)
        return res.status(400).json({ error: "Category required for warden" });

      const catIndex = doc.data.findIndex((c) => c.category === category);
      if (catIndex === -1)
        return res.status(404).json({ error: "Category not found" });

      doc.data[catIndex].members = doc.data[catIndex].members.filter(
        (m) => !Object.keys(meta_data).every((k) => m[k] === meta_data[k])
      );

      await mainCollection.updateOne(
        { type: "warden" },
        { $set: { data: doc.data } }
      );

      return res.json({ message: "Warden deleted successfully" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

module.exports = { deleteData };