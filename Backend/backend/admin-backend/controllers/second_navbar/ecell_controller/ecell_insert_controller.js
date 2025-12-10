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

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      if (meta_data.mission) {
        // add new mission statement
        doc.data[0].mission.push(meta_data.mission);
      }
      if (meta_data.about) {
        doc.data[0].about = meta_data.about;
      }
      if (meta_data.vision) {
        doc.data[0].vision = meta_data.vision;
      }

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "About data inserted successfully", data: doc.data };
    }
    

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
          { $push: { data: meta_data } }
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
          { $push: { data: meta_data } }
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
          { $push: { data: meta_data } }
        );
      }
      return { success: true, message: "Activity data inserted successfully" };
    }

    // ---------- GALLERY ----------
    if (collection_type === "gallery") {
    if (!meta_data.image_path) throw new Error("Image path required");

    if (!doc) {
    // No document yet, create object structure
    await mainCollection.insertOne({
      type: collection_type,
      data: { image_path: meta_data.image_path },
    });
    } else {
    // Document exists, append new images
    if (!doc.data || typeof doc.data !== "object") {
      doc.data = { image_path: [] };
    }
    if (!Array.isArray(doc.data.image_path)) {
      doc.data.image_path = [];
    }

    // Append new images
    doc.data.image_path.push(...meta_data.image_path);

    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { data: doc.data } }
    );
    }

    return { success: true, message: "Gallery images updated successfully", data: doc ? doc.data : meta_data };
    }


    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ no res.json, just throw
  }
}

module.exports = { insertData };