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

      return { message: "Deleted successfully" };
    }

    /* ---------------- CATEGORY BASED TYPES ---------------- */
    if (!categoryBasedTypes.includes(collection_type)) {
      throw new Error("Unsupported collection_type");
    }

    if (!category) throw new Error("Missing category");

    const categoryExists = doc.data.find(
      (item) => item.category === category
    );
    if (!categoryExists) throw new Error("Category not found");

    /* ---------- DELETE ENTIRE CATEGORY ---------- */
    if (Object.keys(meta_data).length === 0) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { category } } }
      );

      return { message: "Category deleted" };
    }

    /* ---------- DELETE SINGLE ITEM ---------- */
    const field =
      collection_type === "COE"
        ? "members"
        : collection_type === "regulation"
        ? "links"
        : "content";

    const updatedArray = categoryExists[field].filter(
      (item) =>
        !Object.keys(meta_data).every(
          (key) => item[key] === meta_data[key]
        )
    );

    await mainCollection.updateOne(
      { type: collection_type },
      { $set: { [`data.$[elem].${field}`]: updatedArray } },
      { arrayFilters: [{ "elem.category": category }] }
    );

    return { message: "Item deleted successfully" };

  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

module.exports = { deleteData };
