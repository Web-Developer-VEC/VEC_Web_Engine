// ------------------- INSERT -------------------
async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and newData required");
    }

    // Handle file uploads (gallery support)
    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    // ---------- COMMITTEE ----------
    if (collection_type === "committee") {
      if (!doc) {
        await mainCollection.insertOne({
          type: collection_type,
          data: [meta_data],
        });
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: meta_data } },
        );
      }
      return { success: true, message: "Committee data inserted successfully" };
    }

    // ---------- ENTREPRENEUR ----------
    if (collection_type === "enterpreneur") {
      if (!doc) {
        await mainCollection.insertOne({
          type: collection_type,
          data: [meta_data],
        });
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: meta_data } },
        );
      }
      return {
        success: true,
        message: "Entrepreneur data inserted successfully",
      };
    }

    // ---------- ACTIVITY ----------
    if (collection_type === "activity") {
      if (!meta_data.year || !meta_data.pdf_path) {
        throw new Error("Activity requires year and pdf_path");
      }
      if (!doc) {
        await mainCollection.insertOne({
          type: collection_type,
          data: [meta_data],
        });
      } else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: meta_data } },
        );
      }
      return { success: true, message: "Activity data inserted successfully" };
    }

    // ---------- GALLERY ----------
    if (collection_type === "gallery") {
      if (
        !meta_data ||
        !Array.isArray(meta_data.image_path) ||
        meta_data.image_path.length === 0
      ) {
        throw new Error("meta_data.image_path must be a non-empty array");
      }

      const result = await mainCollection.updateOne(
        { type: "gallery" },
        {
          $push: {
            "data.image_path": { $each: meta_data.image_path }
          },
        },
        {
          upsert: true,
        },
      );

      return {
        success: true,
        message: "Gallery images added successfully",
        added_images: meta_data.image_path,
      };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

module.exports = { insertData };