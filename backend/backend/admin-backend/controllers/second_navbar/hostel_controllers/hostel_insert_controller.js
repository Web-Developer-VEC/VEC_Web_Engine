async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and newData required");
    }

    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    // ---------- ABOUT ----------
    if (collection_type === "about") {
      let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data];

      updatedData = updatedData.map((item) => {
        let newItem = { ...item };
        Object.keys(meta_data).forEach((key) => {
          if (newItem.hasOwnProperty(key)) {
            if (Array.isArray(newItem[key])) {
              newItem[key] = [
                ...new Set([
                  ...newItem[key],
                  ...(Array.isArray(meta_data[key])
                    ? meta_data[key]
                    : [meta_data[key]]),
                ]),
              ];
            } else {
              newItem[key] = [
                ...new Set([
                  newItem[key],
                  ...(Array.isArray(meta_data[key])
                    ? meta_data[key]
                    : [meta_data[key]]),
                ]),
              ];
            }
          } else {
            newItem[key] = Array.isArray(meta_data[key])
              ? meta_data[key]
              : [meta_data[key]];
          }
        });
        return newItem;
      });

      await mainCollection.updateOne(
        { type: "about" },
        { $set: { data: updatedData } }
      );

      return {
        success: true,
        message: "About data updated successfully",
        data: updatedData,
      };
    }

    // ---------- HOSTEL FACILITIES ----------
    if (collection_type === "hostel_facilities") {
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
        message: "Hostel facilities inserted successfully",
      };
    }

    // ---------- WARDEN ----------
    if (collection_type === "warden") {
      if (!category) throw new Error("Category required for warden");

      if (doc) {
        const categoryExists = doc.data.find((c) => c.category === category);

        if (categoryExists) {
          await mainCollection.updateOne(
            { type: collection_type, "data.category": category },
            { $push: { "data.$.members": meta_data } }
          );
        } else {
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { category, members: [meta_data] } } }
          );
        }
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: [{ category, members: [meta_data] }],
        });
      }

      return { success: true, message: "Warden data inserted successfully" };
    }

    // ---------- GENERAL INFO ----------
    if (collection_type === "general_info") {
      if (!category) throw new Error("Category required for general_info");

      if (doc) {
        const categoryExists = doc.data.find((c) => c.category === category);

        if (categoryExists) {
          if (category === "Menu") {
            await mainCollection.updateOne(
              { type: collection_type, "data.category": category },
              {
                $push: {
                  "data.$.content.0.hostel_menu.0.day": {
                    $each: meta_data.day || [],
                  },
                  "data.$.content.0.hostel_menu.0.Breakfast": {
                    $each: meta_data.Breakfast || [],
                  },
                  "data.$.content.0.hostel_menu.0.lunch": {
                    $each: meta_data.lunch || [],
                  },
                  "data.$.content.0.hostel_menu.0.snacks": {
                    $each: meta_data.snacks || [],
                  },
                  "data.$.content.0.hostel_menu.0.dinner": {
                    $each: meta_data.dinner || [],
                  },
                },
              }
            );
          } else {
            await mainCollection.updateOne(
              { type: collection_type, "data.category": category },
              { $push: { "data.$.content": meta_data } }
            );
          }
        } else {
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { category, content: [meta_data] } } }
          );
        }
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: [{ category, content: [meta_data] }],
        });
      }

      return { success: true, message: "General info inserted successfully" };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ no res.json, just throw
  }
}


module.exports = { insertData };