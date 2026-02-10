async function insertData( tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    // 1️⃣ Validate required fields
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }

    // 2️⃣ Define type categories
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

    // 3️⃣ Single document type → overwrite
    if (singleDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: [meta_data] } },
        { upsert: true }
      );
      return { status: 200, message: `Overwritten successfully for ${collection_type}`, data: meta_data };
    }

    // 4️⃣ Multi-document type → append
    if (multiDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $push: { data: meta_data } },
        { upsert: true }
      );
      return {
        status: 200,
        message: `Inserted successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 5️⃣ Category-based → insert or merge
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category) throw new Error("category is required");

      const doc = await mainCollection.findOne({ type: collection_type });
      const categoryExists = doc?.data?.find((c) => c.category === category);

      if (categoryExists) {
        const content = categoryExists.content;
        const members = categoryExists.members;

        if (Array.isArray(content) && typeof content[0] === "string") {
          // Array of primitives → merge uniquely
          const newItems = Array.isArray(meta_data?.content)
            ? meta_data.content
            : [meta_data];

          const merged = [...new Set([...content, ...newItems])];

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $set: { "data.$.content": merged } }
          );
        } else if (Array.isArray(content) && typeof content[0] === "object" || Array.isArray(members) && typeof members[0] === "object") {
    
          const newItems = Array.isArray(meta_data?.content)? meta_data.content: meta_data; // Ensure newItems is an array

          const updateField =
            collection_type === "student_representation"
              ? "data.$.members"
              : "data.$.content";

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $push: { [updateField]: newItems } }
          );
        } else {
          // Single object → push into content array
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            {
              $set: {
                "data.$.content": Array.isArray(meta_data)
                  ? meta_data
                  : [meta_data],
              },
            }
          );
        }
      } else {
        // Create new category
        await mainCollection.updateOne(
          { type: collection_type },
          {
            $set: {
              data: {
                category,
                content: Array.isArray(meta_data)
                  ? meta_data
                  : [meta_data],
              },
            },
          },
          { upsert: true }
        );
      }

      return {
        status: 200,
        message: `Insert successful for ${collection_type} - category ${category}`,
        data: meta_data,
      };
    }

    // 6️⃣ Unknown type fallback
    throw new Error("Unknown collection_type");
  } catch (error) {
    console.error("Error inserting data:", error);
    throw new Error("Internal server error");
  }
}

module.exports = { insertData };
