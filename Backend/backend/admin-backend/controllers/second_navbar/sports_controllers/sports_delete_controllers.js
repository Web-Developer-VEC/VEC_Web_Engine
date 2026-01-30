async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    if (!collection_type) {
      return { success: false, message: "collection_type is required" };
    }

    // 1️⃣ String-array types
    const singleDocTypes = ["introduction", "vision"];

    if (singleDocTypes. includes(collection_type)) {
      if (!meta_data) {
        return { success: false, message: "meta_data is required for deletion" };
      }

      let deleteArray;

      // ✅ Handle array of items to delete
      if (Array.isArray(meta_data)) {
        deleteArray = meta_data; // Delete ALL items in the array
      } else if (typeof meta_data === "object" && meta_data !== null) {
        deleteArray = Object.values(meta_data); // Extract all values from object
      } else {
        deleteArray = [meta_data]; // Single item
      }

      // ✅ Use $in to delete multiple items at once
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { $in: deleteArray } } }
      );

      return {
        success: true,
        message: `Deleted ${deleteArray.length} item(s) successfully from ${collection_type}`,
        deleted: deleteArray,
      };
    }

    // 2️⃣ Multi-doc flat objects (FIXED)
    const multiDocTypes = ["hod", "faculty", "infrastructure", "intramural"];
    if (multiDocTypes.includes(collection_type)) {
      if (!meta_data) {
        return { success: false, message: "meta_data required" };
      }

      // ✅ Build a match query based on provided fields
      // This handles cases where DB might have extra fields
      const matchQuery = {};
      
      // Use specific fields for matching
      if (meta_data.title) matchQuery["data.title"] = meta_data.title;
      if (meta_data.description) matchQuery["data.description"] = meta_data.description;
      if (meta_data.image_path) matchQuery["data.image_path"] = meta_data.image_path;
      if (meta_data.name) matchQuery["data.name"] = meta_data.name;
      if (meta_data.email) matchQuery["data.email"] = meta_data.email;
      if (meta_data.phone) matchQuery["data.phone"] = meta_data.phone;
      
      // For infrastructure, typically match by title or image_path as unique identifier
      const pullQuery = {};
      
      // Try to find the most unique field to match on
      if (meta_data. image_path) {
        // Match by image_path (usually unique)
        pullQuery.image_path = meta_data. image_path;
      } else if (meta_data.title) {
        // Match by title
        pullQuery.title = meta_data.title;
      } else if (meta_data.email) {
        // For faculty/hod, email is unique
        pullQuery.email = meta_data.email;
      } else {
        // Fallback: match all provided fields
        pullQuery = { ... meta_data };
      }

      const result = await mainCollection.updateOne(
        { type: collection_type },
        { $pull:  { data: pullQuery } }
      );

      if (result.modifiedCount === 0) {
        return {
          success: false,
          message: `No matching document found in ${collection_type}`,
        };
      }

      return {
        success: true,
        message: `Deleted one document from ${collection_type}`,
        deleted: meta_data,
      };
    }

    // 3️⃣ Achievements - category based
    const categoryBasedTypes = ["achivements"];

    if (categoryBasedTypes. includes(collection_type)) {
      if (!category) {
        return { success:  false, message: "category is required" };
      }

      const doc = await mainCollection.findOne({ type: collection_type });
      if (!doc) {
        return { success: false, message: "Document not found" };
      }

      const categoryExists = doc.data. find((c) => c.category === category);
      if (!categoryExists) {
        return { success: false, message: `Category ${category} not found` };
      }

      const content = categoryExists.content;
      if (category === "coordinator") {
        if (!meta_data || ! meta_data.year || !meta_data.zone) {
          throw new Error("Both year and zone are required for coordinator delete");
        }

        // Case A: Delete specific image paths
        if (meta_data. image_path && meta_data.image_path. length > 0) {
          const deleteArray = Array.isArray(meta_data. image_path)
            ? meta_data.image_path
            : [meta_data.image_path];

          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            {
              $pull: {
                "data.$[elem].content.$[con].image_path": { $in: deleteArray }
              }
            },
            {
              arrayFilters: [
                { "elem.category": category },
                { "con.zone": meta_data.zone, "con.year": meta_data.year }
              ]
            }
          );

          return {
            success: true,
            message: `Deleted ${deleteArray.length} image(s) from coordinator year ${meta_data.year}, zone ${meta_data.zone}`
          };
        }
        else if (Array.isArray(meta_data. image_path) && meta_data.image_path.length === 0) {
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            {
              $pull: {
                "data.$[elem].content":  { year: meta_data.year }
              }
            },
            {
              arrayFilters: [{ "elem.category": category }]
            }
          );

          return {
            success: true,
            message: `Deleted content for year ${meta_data.year} in category ${category}`
          };
        }
        // Case B: Delete the entire coordinator block (year + zone)
        else {
          const result = await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { data: { category, "content.year": meta_data.year, "content.zone": meta_data.zone } } }
          );

          return {
            success: true,
            message: `Deleted coordinator block for year ${meta_data.year}, zone ${meta_data.zone}`,
            result
          };
        }
      }

      if (category === "coordinator") {
        if (!meta_data || !meta_data.year) {
          throw new Error("Year is required for coordinator delete");
        }

        // Find category first
        const categoryExists = doc.data.find((c) => c.category === category && c.year === meta_data. year);
        if (!categoryExists) {
          throw new Error(`Year ${meta_data.year} not found in coordinator`);
        }

        // Case A: Delete specific content item(s)
        if (meta_data.content && meta_data. content.length > 0) {
          const deleteArray = Array. isArray(meta_data.content) ?  meta_data.content : [meta_data.content];

          const result = await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { "data.$[elem].content": { $in: deleteArray } } },
            { arrayFilters: [{ "elem.category": category, "elem.year": meta_data.year }] }
          );

          return {
            success: true,
            message: `Deleted ${deleteArray.length} item(s) from coordinator ${meta_data.year}`,
            result
          };
        }

        // Case B: Delete entire year block
        else {
          const result = await mainCollection.updateOne(
            { type: collection_type },
            { $pull: { data: { category, year: meta_data.year } } }
          );

          return {
            success: true,
            message: `Deleted coordinator block for year ${meta_data.year}`,
            result
          };
        }
      }

      // Case A: Array of strings
      if (Array.isArray(content) && typeof content[0] === "string") {
        if (!meta_data) {
          return { success: false, message: "meta_data required for deletion" };
        }

        const deleteArray = Array.isArray(meta_data) ? meta_data : [meta_data];

        await mainCollection.updateOne(
          { type: collection_type, "data.category": category },
          { $pull: { "data. $. content": { $in: deleteArray } } }
        );
      }

      // Case B: Array of objects
      else if (Array.isArray(content) && typeof content[0] === "object") {
        if (!meta_data || Object.keys(meta_data).length === 0) {
          return { success: false, message: "meta_data required for deletion" };
        }

        // Build a query filter from meta_data
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { "data.$[elem].content": meta_data } },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      // Case C: Single object
      else if (content && typeof content === "object") {
        if (!meta_data || Object.keys(meta_data).length === 0) {
          return { success: false, message: "meta_data required for deletion" };
        }

        // Delete only matching fields inside the object
        const unsetFields = {};
        for (const key of Object. keys(meta_data)) {
          unsetFields[`data.$[elem].content.${key}`] = "";
        }

        await mainCollection.updateOne(
          { type: collection_type },
          { $unset: unsetFields },
          { arrayFilters: [{ "elem.category": category }] }
        );
      }

      return {
        success: true,
        message: `Deleted successfully in ${collection_type} - category ${category}`,
        deleted: meta_data,
      };
    }

    // 4️⃣ Action Plan
    const singleCategoryTypes = ["action_plan"];

    if (singleCategoryTypes.includes(collection_type)) {
      const doc = await mainCollection.findOne({ type: collection_type });
      if (!doc) {
        return { success: false, message:  "Document not found" };
      }

      if (!meta_data) {
        return { success:  false, message: "meta_data is required" };
      }

      const docExists = doc.data?.[0];
      if (! docExists) {
        return { success: false, message: "No data found for action_plan" };
      }

      // Delete training
      if (meta_data. training && docExists.training === meta_data.training) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $unset: { "data.0.training": "" } }
        );
      }

      // Delete from goals array
      if (meta_data.goals) {
        await mainCollection. updateOne(
          { type:  collection_type },
          { $pull: { "data.0.goals": meta_data.goals } }
        );
      }

      // Delete from health array
      if (meta_data.health) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull: { "data.0.health": meta_data.health } }
        );
      }

      // Delete from facilities array
      if (meta_data.facilities) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $pull:  { "data.0.facilities":  meta_data.facilities } }
        );
      }

      return {
        success: true,
        message: `Deleted successfully in ${collection_type}`,
        deleted: meta_data,
      };
    }

    return { success: false, message: "Invalid delete request" };
  } catch (error) {
    console.error("Error deleting data:", error);
    return { success: false, message: "Internal server error" };
  }
}

module.exports = { deleteData };