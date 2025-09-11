async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category, original_data } = tempDoc;

    // 1️⃣ Validate required fields
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    // 2️⃣ Fetch the document for this collection_type
    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document not found");
    if (!doc.data) throw new Error("Document has no data field");

    // Debug
    console.log("🔎 Incoming update request:", {
      collection_type,
      category,
      original_data,
      meta_data,
    });

    // 3️⃣ Define type categories
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
      "policy",
    ];
    const categoryBasedTypes = [
      "establishment",
      "student_representation",
      "yukti",
    ];

    // 4️⃣ Single-doc types → overwrite entire data array
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: [meta_data] } }
      );
      return {
        message: `Updated successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 5️⃣ Category-based
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) throw new Error("category is required");

      const categoryExists = doc.data.find((c) => c.category === category);
      if (!categoryExists) throw new Error(`Category ${category} not found`);

      const content = categoryExists.content;
      const members = categoryExists.members;
      // Case A: Array of strings
      if (Array.isArray(content) && typeof content[0] === "string") {
        if (!original_data) throw new Error("original_data required");

        // Unwrap { content: [...] } if present
        const originalArray = Array.isArray(original_data?.content)
          ? original_data.content
          : Array.isArray(original_data)
          ? original_data
          : [original_data];

        const metaArray = Array.isArray(meta_data?.content)
          ? meta_data.content
          : Array.isArray(meta_data)
          ? meta_data
          : [meta_data];

        // const updated = content.map((item) =>
        //   originalArray.includes(item)
        //     ? metaArray[originalArray.indexOf(item)] || item
        //     : item
        // );

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category }, // ✅ find by type + category
          { $set: { "data.$.content": metaArray } } // ✅ update the matching category
        );
      }

      // Case B: Array of objects → match by title
      else if (
        (Array.isArray(content) && content.length > 0) ||
        (Array.isArray(members) && members.length > 0)
      ) {
        if (!original_data) {
          return res.status(400).json({ message: "original_data required" });
        }

        // Compare by keys instead of JSON.stringify
        const isEqual = (obj1, obj2) =>
          Object.keys(obj1).every((key) => obj2[key] === obj1[key]);

        const updatedArray = (
          collection_type === "student_representation" ? members : content
        ).map((item) =>
          isEqual(item, original_data) ? { ...item, ...meta_data } : item
        );
        const upd = Array.isArray(updatedArray) ? updatedArray : updatedArray;
        const updateField =
          collection_type === "student_representation"
            ? "data.$[elem].members"
            : "data.$[elem].content";



        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { [updateField]: upd } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      // Case C: Single object → overwrite
      else {
        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.$[elem].content": meta_data } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      return {
        message: `Updated successfully in ${collection_type} - category ${category}`,
        data: meta_data,
      };
    }

    // 6️⃣ Multi-document types → array of objects without category
    if (multiDocTypes.includes(collection_type)) {
      if (!original_data) {
        throw new Error("original_data is required for multi-doc updates");
      }

      const updatedData = doc.data.map((item) => {
        // Compare object equality
        if (JSON.stringify(item) === JSON.stringify(original_data)) {
          return { ...item, ...meta_data };
        }
        return item;
      });
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: updatedData } }
      );

      return {
        status:200,
        message: `Updated successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 7️⃣ No matching case found
    throw new Error("No matching case found");
  } catch (error) {
    console.error("Error updating data:", error);
    throw new Error("Internal server error");
  }
}

module.exports = { updateData };
