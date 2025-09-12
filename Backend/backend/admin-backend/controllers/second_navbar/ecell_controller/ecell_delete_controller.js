// ------------------- DELETE -------------------   
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Type not found");

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      if (meta_data.mission) {
        doc.data[0].mission = doc.data[0].mission.filter((m) => m !== meta_data.mission);
      } else {
        throw new Error("Only mission deletion is supported");
      }

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Mission deleted successfully", data: doc.data };
    }


    // ---------- COMMITTEE ----------
    if (collection_type === "committee") {
      const updatedData = doc.data.filter(
        (item) => !Object.keys(meta_data).every((k) => item[k] === meta_data[k])
      );

      await mainCollection.updateOne(
        { type: "committee" },
        { $set: { data: updatedData } }
      );

      return { success: true, message: "Committee member deleted successfully" };
    }

    // ---------- ENTREPRENEUR ----------
    if (collection_type === "enterpreneur") {
      const updatedData = doc.data.filter(
        (item) => !Object.keys(meta_data).every((k) => item[k] === meta_data[k])
      );

      await mainCollection.updateOne(
        { type: "enterpreneur" },
        { $set: { data: updatedData } }
      );

      return { success: true, message: "Entrepreneur deleted successfully" };
    }

    // ---------- ACTIVITY ----------
    if (collection_type === "activity") {
      const updatedData = doc.data.filter(
        (item) => !Object.keys(meta_data).every((k) => item[k] === meta_data[k])
      );

      await mainCollection.updateOne(
        { type: "activity" },
        { $set: { data: updatedData } }
      );

      return { success: true, message: "Activity deleted successfully" };
    }

    // ---------- GALLERY ----------
    if (collection_type === "gallery") {
      const updatedData = doc.data.filter((path) => path !== meta_data.image_path);

      await mainCollection.updateOne(
        { type: "gallery" },
        { $set: { data: updatedData } }
      );

      return { success: true, message: "Gallery image deleted successfully" };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ don’t send res.json here
  }
}

module.exports = { deleteData };
