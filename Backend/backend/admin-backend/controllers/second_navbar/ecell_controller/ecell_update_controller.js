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
      const updateData = Array.isArray(meta_data) ? meta_data : [meta_data];

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: updateData } },
      );
      return {
        success: true,
        message: "About data updated successfully",
        data: doc.data,
      };
    }

    // ---------- COMMITTEE ----------
    if (collection_type === "committee") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k]),
      );

      if (index === -1) throw new Error("Committee member not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "committee" },
        { $set: { data: doc.data } },
      );

      return {
        success: true,
        message: "Committee member updated successfully",
      };
    }

    // ---------- ENTREPRENEUR ----------
    if (collection_type === "enterpreneur") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k]),
      );

      if (index === -1) throw new Error("Entrepreneur not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "enterpreneur" },
        { $set: { data: doc.data } },
      );

      return { success: true, message: "Entrepreneur updated successfully" };
    }

    // ---------- ACTIVITY ----------
    if (collection_type === "activity") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k]),
      );

      if (index === -1) throw new Error("Activity not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "activity" },
        { $set: { data: doc.data } },
      );

      return { success: true, message: "Activity updated successfully" };
    }

    // ---------- GALLERY ----------
    if (collection_type === "gallery") {
      // 1. Validate inputs
      if (
        !Array.isArray(original_data.image_path) ||
        !Array.isArray(meta_data.image_path) ||
        original_data.image_path.length === 0 ||
        original_data.image_path.length !== meta_data.image_path.length
      ) {
        throw new Error(
          "original_data.image_path and meta_data.image_path must be arrays of equal length",
        );
      }

      if (!Array.isArray(doc.data)) {
        throw new Error("Gallery data is corrupted or not an array");
      }

      // 2. Replace images
      original_data.image_path.forEach((oldPath, i) => {
        const index = doc.data.findIndex((img) => img === oldPath);

        if (index === -1) {
          throw new Error(`Image not found in gallery: ${oldPath}`);
        }

        doc.data[index] = meta_data.image_path[i];
      });

      // 3. Save update
      await mainCollection.updateOne(
        { type: "gallery" },
        { $set: { data: doc.data } },
      );

      // 4. Response
      return {
        success: true,
        message: "Gallery image(s) updated successfully",
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
