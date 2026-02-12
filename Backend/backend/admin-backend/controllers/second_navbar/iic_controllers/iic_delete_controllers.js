async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type)
      return { status: 400, message: "collection_type is required" };

    const singleDocTypes = ["home", "contact"];
    const multiDocTypes = [
      "faculty",
      "expert_representation",
      "iic3",
      "iic4",
      "iic5",
      "iic6",
      "iic7",
      "kapila",
      "mentee",
      "certificate",
      "policy"
    ];
    const categoryBasedTypes = [
      "establishment",
      "student_representation",
      "yukti"
    ];

    // 1️⃣ Single-doc → clear all data
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: [] } }
      );
      return {
        status: 200,
        message: `Deleted entire document for ${collection_type}`,
      };
    }

    // 2️⃣ Multi-doc → delete item by unique key or full object
    if (multiDocTypes.includes(collection_type)) {
      if (!meta_data || Object.keys(meta_data).length === 0)
        return res
          .status(400)
          .json({ message: "meta_data required to delete specific item" });

      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: meta_data } }
      );
      return {status:200,
        message: `Deleted one document from ${collection_type}`,
        deleted: meta_data,
      };
    }

    // 3️⃣ Category-based
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category)
        return res.status(400).json({ message: "category is required" });

      const doc = await mainCollection.findOne({ type: collection_type });
      const categoryExists = doc?.data?.find((c) => c.category === category);
      if (!categoryExists)
        return { status:200, message: `Category ${category} not found` };

      const content = collection_type === "student_representation" ? categoryExists.members: categoryExists.content;

      if (
        !meta_data ||
        (typeof meta_data === "object" &&
          !Array.isArray(meta_data) &&
          Object.keys(meta_data).length === 0) ||
        (Array.isArray(meta_data) && meta_data.length === 0) ||
        (meta_data.content && meta_data.content.length === 0)
      ) {
        // Delete entire category
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { data: { category } } }
        );
      } 
      else if (Array.isArray(content) && typeof content[0] === "object") {

        const categorydata = collection_type === "student_representation" ? "data.$.members": "data.$.content";
        const pullCondition = {};

        for (const [key, value] of Object.entries(meta_data)) {
          pullCondition[key] = value;
        }

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          {
            $pull: {
              [categorydata]: pullCondition
            }
          }
        );
      } else {
        // Fallback: clear content
        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $set: { "data.$.members": [] } }
        );
      }

      return { status:200,
        message: `Delete successful for ${collection_type} - category ${category}`,
        data: meta_data,
      };
    }

    return { status:400, message: "Invalid delete request" };
  } catch (error) {
    console.error("Error deleting data:", error);
    return { status:400, message: "Internal server error" };
  }
}

module.exports = { deleteData };
