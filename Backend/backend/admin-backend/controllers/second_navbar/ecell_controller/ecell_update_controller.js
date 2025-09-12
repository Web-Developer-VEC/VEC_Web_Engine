// ------------------- UPDATE -------------------
async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Type, newData and originalData required");
    }

    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Type not found");

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      if (original_data.about && meta_data.about) {
        doc.data[0].about = meta_data.about;
      }
      if (original_data.vision && meta_data.vision) {
        doc.data[0].vision = meta_data.vision;
      }
      if (original_data.mission && meta_data.mission) {
        const index = doc.data[0].mission.findIndex((m) => m === original_data.mission);
        if (index === -1) throw new Error("Mission statement not found");
        doc.data[0].mission[index] = meta_data.mission;
      }

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "About data updated successfully", data: doc.data };
    }


    // ---------- COMMITTEE ----------
    if (collection_type === "committee") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );

      if (index === -1) throw new Error("Committee member not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "committee" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Committee member updated successfully" };
    }

    // ---------- ENTREPRENEUR ----------
    if (collection_type === "enterpreneur") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );

      if (index === -1) throw new Error("Entrepreneur not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "enterpreneur" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Entrepreneur updated successfully" };
    }

    // ---------- ACTIVITY ----------
    if (collection_type === "activity") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );

      if (index === -1) throw new Error("Activity not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "activity" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Activity updated successfully" };
    }

    // ---------- GALLERY ----------
    if (collection_type === "gallery") {
      const index = doc.data.findIndex((img) => img === original_data.image_path);
      if (index === -1) throw new Error("Image not found in gallery");

      // replace old image with new one
      doc.data[index] = meta_data.image_path;

      await mainCollection.updateOne(
        { type: "gallery" },
        { $set: { data: doc.data } }
      );

      return {
        success: true,
        message: "Gallery image updated successfully",
        data: doc.data,
      };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ don't send response here
  }
}

module.exports = { updateData };
