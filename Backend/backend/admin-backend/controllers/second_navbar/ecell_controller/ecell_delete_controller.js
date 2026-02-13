// ------------------- DELETE -------------------
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Type not found");

    // ---------- COMMITTEE ----------
    if (collection_type === "committee") {
      const updatedData = doc.data.filter(
        (item) =>
          !Object.keys(meta_data).every((k) => item[k] === meta_data[k]),
      );

      await mainCollection.updateOne(
        { type: "committee" },
        { $set: { data: updatedData } },
      );

      return {
        success: true,
        message: "Committee member deleted successfully",
      };
    }

    // ---------- ENTREPRENEUR ----------
    if (collection_type === "enterpreneur") {
      const updatedData = doc.data.filter(
        (item) =>
          !Object.keys(meta_data).every((k) => item[k] === meta_data[k]),
      );

      await mainCollection.updateOne(
        { type: "enterpreneur" },
        { $set: { data: updatedData } },
      );

      return { success: true, message: "Entrepreneur deleted successfully" };
    }

    // ---------- ACTIVITY ----------
    if (collection_type === "activity") {
      const updatedData = doc.data.filter(
        (item) =>
          !Object.keys(meta_data).every((k) => item[k] === meta_data[k]),
      );

      await mainCollection.updateOne(
        { type: "activity" },
        { $set: { data: updatedData } },
      );

      return { success: true, message: "Activity deleted successfully" };
    }

    // ---------- GALLERY ----------
    if (collection_type === "gallery") {
      if (
        !Array.isArray(meta_data.image_path) ||
        meta_data.image_path.length === 0
      ) {
        throw new Error("meta_data.image_path must be a non-empty array");
      }

      if (!Array.isArray(doc.data)) {
        throw new Error("Gallery data is not an array");
      }

      const updatedData = doc.data.filter(
        (path) => !meta_data.image_path.includes(path),
      );

      if (updatedData.length === doc.data.length) {
        throw new Error("No matching image paths found to delete");
      }

      await mainCollection.updateOne(
        { type: "gallery" },
        { $set: { data: updatedData } },
      );

      return {
        success: true,
        message: "Gallery image(s) deleted successfully",
        data: updatedData,
      };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ don’t send res.json here
  }
}

module.exports = { deleteData };
