async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Missing required fields");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document not found");

    const multipleObjectTypes = ["exam_curriculum"];
    const categoryBasedTypes = ["COE", "regulation", "all_forms", "rankholder"];

    /* ---------------- MULTI OBJECT TYPES ---------------- */
    if (multipleObjectTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: meta_data } }
      );

      return { success: true, message: "Deleted successfully" };  
    }

    /* ---------------- CATEGORY BASED TYPES ---------------- */
    if (!categoryBasedTypes.includes(collection_type)) {
      throw new Error("Unsupported collection_type");
    }

    if (!category) throw new Error("Missing category");

    const field =
      collection_type === "COE"
        ? "members"
        : collection_type === "regulation"
        ? "links"
        : "content";

    const categoryExists = doc.data.find(
      (item) => item.category === category
    );

    if (!categoryExists) throw new Error("Category not found");

    const deleteItems = meta_data[field] || [];

    /* ---------- DELETE ENTIRE CATEGORY IF ALL ITEMS MATCH ---------- */

    if (deleteItems.length === categoryExists[field].length) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { category } } }
      );

      return { success: true, message: "Category deleted successfully" };
    }

    /* ---------- DELETE PARTIAL ITEMS ---------- */

    await mainCollection.updateOne(
      { type: collection_type, "data.category": category },
      {
        $pull: {
          [`data.$.${field}`]: { $in: deleteItems }
        }
      }
    );

    return { success: true, message: "Items deleted successfully" };

  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

module.exports = { deleteData };