async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Missing required fields: collection_type or meta_data");
    }

    const doc = await mainCollection.findOne({ type: collection_type });

    const multipleObjectTypes = ["exam_curriculum"];
    const categoryBasedTypes = ["COE", "regulation", "all_forms", "rankholder"];

    /* ---------------- MULTI OBJECT TYPES ---------------- */
    if (multipleObjectTypes.includes(collection_type)) {
      if (!doc) throw new Error("Document not found");

      await mainCollection.updateOne(
        { type: collection_type },
        { $push: { data: meta_data } }
      );

      return { message: "Inserted successfully" };
    }

    /* ---------------- CATEGORY BASED TYPES ---------------- */
    if (!categoryBasedTypes.includes(collection_type)) {
      throw new Error("Unsupported collection_type");
    }

    if (!category) throw new Error("Missing category");
    if (!doc) throw new Error("Document not found");

    const categoryExists = doc.data.find(
      (item) => item.category === category
    );

    /* ---------- CATEGORY EXISTS → PUSH ITEM ---------- */
    if (categoryExists) {
      const updateField =
        collection_type === "COE"
          ? "data.$.members"
          : collection_type === "regulation"
          ? "data.$.links"
          : "data.$.content";

      await mainCollection.updateOne(
        { type: collection_type, "data.category": category },
        { $push: { [updateField]: meta_data } }
      );

      return { message: "Inserted into existing category" };
    }

    /* ---------- NEW CATEGORY → CREATE ---------- */
    let newCategoryObject;

    if (collection_type === "COE") {
      newCategoryObject = {
        category,
        members: Array.isArray(meta_data.members)
          ? meta_data.members
          : [meta_data],
      };
    } 
    else if (collection_type === "regulation") {
      newCategoryObject = {
        category,
        links: Array.isArray(meta_data.links)
          ? meta_data.links
          : [meta_data], // ✅ FIX: wrap single link
      };
    } 
    else {
      // all_forms & rankholder
      newCategoryObject = {
        category,
        content: Array.isArray(meta_data.content)
          ? meta_data.content
          : [meta_data], // ✅ FIX: wrap single item
      };
    }

    await mainCollection.updateOne(
      { type: collection_type },
      { $push: { data: newCategoryObject } }
    );

    return { message: "New category created and inserted" };

  } catch (error) {
    throw new Error(`Insert failed: ${error.message}`);
  }
}

module.exports = { insertData };
