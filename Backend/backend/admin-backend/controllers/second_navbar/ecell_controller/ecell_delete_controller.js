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
   // ---------- GALLERY ----------
if (collection_type === "gallery") {
  if (
    !Array.isArray(meta_data.image_path) ||
    meta_data.image_path.length === 0
  ) {
    throw new Error("meta_data.image_path must be a non-empty array");
  }

  if (!doc.data || !Array.isArray(doc.data.image_path)) {
    throw new Error("Gallery image_path is not an array");
  }

  await mainCollection.updateOne(
    { type: "gallery" },
    {
      $pull: {
        "data.image_path": { $in: meta_data.image_path }
      }
    }
  );

  return {
    success: true,
    message: "Gallery image(s) deleted successfully",
  };
}

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ don’t send res.json here
  }
}

module.exports = { deleteData };