// ------------------- INSERT (RESEARCH) -------------------
async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    // ---------- JOURNAL PUBLICATION ----------
    if (collection_type === "Journal Publication") {
      if (doc) {
        await mainCollection.updateOne(
          { type: "Journal Publication" },
          { $push: { data: meta_data } }
        );
      } else {
        await mainCollection.insertOne({
          type: "Journal Publication",
          data: [meta_data],
        });
      }
      return {
        success: true,
        message: "Journal Publication data inserted successfully",
      };
    }

    // ---------- FUNDED PROJECTS ----------
    if (collection_type === "Funded Projects") {
      if (doc) {
        await mainCollection.updateOne(
          { type: "Funded Projects" },
          { $push: { data: meta_data } }
        );
      } else {
        await mainCollection.insertOne({
          type: "Funded Projects",
          data: [meta_data],
        });
      }
      return {
        success: true,
        message: "Funded Projects data inserted successfully",
      };
    }

    // ---------- CONSULTANCY ----------
    if (collection_type === "Consultancy") {
      if (doc) {
        await mainCollection.updateOne(
          { type: "Consultancy" },
          { $push: { data: meta_data } }
        );
      } else {
        await mainCollection.insertOne({
          type: "Consultancy",
          data: [meta_data],
        });
      }
      return {
        success: true,
        message: "Consultancy data inserted successfully",
      };
    }

    // ---------- BOOKS AND BOOK CHAPTERS ----------
    if (collection_type === "Books and Book chapters") {
      if (doc) {
        await mainCollection.updateOne(
          { type: "Books and Book chapters" },
          { $push: { data: meta_data } }
        );
      } else {
        await mainCollection.insertOne({
          type: "Books and Book chapters",
          data: [meta_data],
        });
      }
      return {
        success: true,
        message: "Books and Book chapters data inserted successfully",
      };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ no res.json, just throw
  }
}

module.exports = { insertData };