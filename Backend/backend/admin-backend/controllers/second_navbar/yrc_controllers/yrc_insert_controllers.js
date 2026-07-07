async function insertData( tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    // 1️⃣ Validate required fields
    if (!collection_type || !meta_data) {
      throw new Error("collection_type and meta_data are required");
    }
if (meta_data.image_path && Array.isArray(meta_data.image_path)) {
      meta_data.image_path = meta_data.image_path[0];
    }
    // 2️⃣ Define type categories
    const singleDocTypes = ["about", "news_updates"];
    const multiDocTypes = ["events","awards"];
    const categoryBasedTypes = ["team"];

    // 3️⃣ Single document type → overwrite
    if (singleDocTypes.includes(collection_type)) {
      let newData;

      if (collection_type === "news_updates" && Array.isArray(meta_data)) {
        // For news_updates: store array of strings directly
        newData = meta_data;
      } else {
        // For other singleDocTypes (like "about"): wrap in array of object
        newData = [meta_data];
      }

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: newData } },
        { upsert: true }
      );

      return {
        success: true,
        message: `Overwritten successfully for ${collection_type}`,
        data: newData,
      };
    }

    // 4️⃣ Multi-document type → append
    if (multiDocTypes.includes(collection_type)) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $push: { data: meta_data } },
        { upsert: true }
      );
      return {
        success: true,
        message: `Inserted successfully for ${collection_type}`,
        data: meta_data,
      };
    }

    // 3️⃣ Category-based → insert or merge
    if (categoryBasedTypes.includes(collection_type)) {
      if (!category)
        throw new Error("category is required");

      const doc = await mainCollection.findOne({ type: collection_type });
      const categoryExists = doc?.data?.find((c) => c.category === category);

      if (categoryExists) {
        const content = categoryExists.members;

        if (Array.isArray(content) && typeof content[0] === "string") {
          // Array of primitives → merge unique
          const newItems = Array.isArray(meta_data?.content)
            ? meta_data.content
            : [meta_data];

          const merged = [...new Set([...content, ...newItems])];

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $set: { "data.$.content": merged } }
          );
        } else if (Array.isArray(content) && content[0]?.name) {
          // Array of objects → add unique by name
          const newItems = Array.isArray(meta_data?.content)
            ? meta_data.content
            : Array.isArray(meta_data)
            ? meta_data
            : [meta_data]; // wrap single object

          newItems.forEach((newItem) => {
            if (!content.some((item) => item.name === newItem.name)) {
              content.push(newItem);
            }
          });

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $set: { "data.$.members": content } }
          );
        } else {
          // Single object → overwrite
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            {
              $set: {
                "data.$.members": Array.isArray(meta_data)
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
            $push: {
              data: {
                category,
                members: Array.isArray(meta_data) ? meta_data : [meta_data],
              },
            },
          },
          { upsert: true }
        );
      }

      return {
        success: true,
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
