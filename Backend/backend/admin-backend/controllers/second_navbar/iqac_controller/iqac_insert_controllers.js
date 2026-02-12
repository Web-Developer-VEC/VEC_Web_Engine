async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      return { success: false, error: "Type and newData required" };
    }

    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    // About Us and Objectives insertion
    if (collection_type === "objectives") {
      let updatedData = { ...doc?.data };

      Object.keys(meta_data).forEach((key) => {
        if (key === "about") {
          if (typeof updatedData[key] === "string") {
            updatedData[key] = updatedData[key] + " " + meta_data[key];
          } else {
            updatedData[key] = meta_data[key];
          }
        } else if (key === "objectives") {
          const existingObjectives = Array.isArray(updatedData[key])
            ? updatedData[key]
            : [];
          const newObjectives = Array.isArray(meta_data[key])
            ? meta_data[key]
            : [meta_data[key]];
          updatedData[key] = [...new Set([...existingObjectives, ...newObjectives])];
        } else {
          if (updatedData.hasOwnProperty(key)) {
            if (Array.isArray(updatedData[key])) {
              updatedData[key] = [
                ...new Set([
                  ...updatedData[key],
                  ...(Array.isArray(meta_data[key]) ? meta_data[key] : [meta_data[key]]),
                ]),
              ];
            } else if (typeof updatedData[key] === "string") {
              updatedData[key] = updatedData[key] + " " + meta_data[key];
            } else {
              updatedData[key] = meta_data[key];
            }
          } else {
            updatedData[key] = meta_data[key];
          }
        }
      });

      await mainCollection.updateOne(
        { type: "objectives" },
        { $set: { data: updatedData } }
      );

      return { success: true, message: "Objectives data updated successfully", data: updatedData };
    }

    // Committee Members insertion
    if (collection_type === "members") {
      if (!category) return { success: false, error: "Category required for members" };

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

      return { success: true, message: "Insert successful for Members" };
    }

    // Minutes of meetings insertion
    if (collection_type === "minutes_of_meetings") {
      if (doc) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $push: { data: meta_data } }
        );
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: [meta_data],
        });
      }

      return { success: true, message: "Insert successful for Minutes of Meetings" };
    }

    // Academic admin audit insertion
    if (collection_type === "academic_admin_audit") {
      if (doc) {
        const existingDept = doc.data.find(
          (dept) => dept.department_name === meta_data.department_name
        );

        if (existingDept) {
          await mainCollection.updateOne(
            { type: collection_type, "data.department_name": meta_data.department_name },
            { $push: { "data.$.year": meta_data.year, "data.$.path": meta_data.path } }
          );
        } else {
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: meta_data } }
          );
        }
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: [meta_data],
        });
      }

      return { success: true, message: "Insert successful for Academic Admin Audit" };
    }

    // Gallery insertion
    // Gallery insertion
    if (collection_type === "gallery") {
      const categories = Array.isArray(meta_data) ? meta_data : [meta_data];

      if (doc) {
        for (const newCategory of categories) {
          const existingCategory = doc.data.find(
            (cat) => cat.category === newCategory.category
          );

          const newImages = Array.isArray(newCategory.image_path)
            ? newCategory.image_path
            : [];

          if (existingCategory) {
            const existingImages = Array.isArray(existingCategory.image_path)
              ? existingCategory.image_path
              : [];

            const imagesToInsert = newImages.filter(
              (img) => !existingImages.includes(img)
            );

            if (imagesToInsert.length > 0) {
              await mainCollection.updateOne(
                { type: collection_type, "data.category": newCategory.category },
                { $push: { "data.$.image_path": { $each: imagesToInsert } } }
              );
            }
          } else {
            await mainCollection.updateOne(
              { type: collection_type },
              {
                $push: {
                  data: {
                    category: newCategory.category,
                    image_path: newImages,
                  },
                },
              }
            );
          }
        }
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: categories.map((c) => ({
            category: c.category,
            image_path: Array.isArray(c.image_path) ? c.image_path : [],
          })),
        });
      }

      return { success: true, message: "Insert successful for Gallery" };
    }

    // Best Practices insertion
    if (collection_type === "best_practices") {
      if (doc) {
        const entries = Array.isArray(meta_data) ? meta_data : [meta_data];

        for (const entry of entries) {
          const existingYear = doc.data.find((d) => d.year === entry.year);
          if (existingYear) {
            await mainCollection.updateOne(
              { type: collection_type, "data.year": entry.year },
              { $set: { "data.$.pdf_path": entry.pdf_path } }
            );
          } else {
            await mainCollection.updateOne({ type: collection_type }, { $push: { data: entry } });
          }
        }
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: Array.isArray(meta_data) ? meta_data : [meta_data],
        });
      }

      return { success: true, message: "Insert successful for Best Practices" };
    }

    // AQAR insertion
    if (collection_type === "aqar") {
      if (doc) {
        const entries = Array.isArray(meta_data) ? meta_data : [meta_data];

        for (const entry of entries) {
          const existingYear = doc.data.find((d) => d.year === entry.year);
          if (existingYear) {
            await mainCollection.updateOne(
              { type: collection_type, "data.year": entry.year },
              { $set: { "data.$.path": entry.path } }
            );
          } else {
            await mainCollection.updateOne({ type: collection_type }, { $push: { data: entry } });
          }
        }
      } else {
        await mainCollection.insertOne({
          type: collection_type,
          data: Array.isArray(meta_data) ? meta_data : [meta_data],
        });
      }

      return { success: true, message: "Insert successful for AQAR" };
    }

    return { success: false, error: "Invalid type" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Server error", details: error.message };
  }
}

module.exports = { insertData };
