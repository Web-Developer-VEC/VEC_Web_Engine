async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, category } = tempDoc;

    if (!collection_type || !meta_data) {
      return { success: false, error: "collection_type and meta_data are required" };
    }

    // Handle image_path rename
    if (tempDoc.meta_data?.filePaths) {
      tempDoc.meta_data.image_path = tempDoc.meta_data.filePaths;
      delete tempDoc.meta_data.filePaths;
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    // 1️⃣ Insert for Intramural, Infrastructure, Faculty, HOD
    const multiDocTypes = ["intramural", "infrastructure", "faculty", "hod"];
    if (multiDocTypes.includes(collection_type)) {
      if (doc) {
        if (Array.isArray(meta_data)) {
          await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { $each: meta_data } } }
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
          data: Array.isArray(meta_data) ? meta_data : [meta_data],
        });
      }
      return { success: true, message: `Insert successful in ${collection_type}` };
    }

    //  Insert for Achievements
    if (collection_type === "achivements") {

      
  if (!category) {
    return { success: false, error: "category is required for achievements" };
  }

  if (doc) {
    let categoryExists = doc.data.find((c) => c.category === category);
if(category === "coordinator") {
  // Ensure content is an array
  if (!Array.isArray(categoryExists.content)) {
    await mainCollection.updateOne(
      { type: collection_type, "data.category": category },
      { $set: { "data.$.content": [categoryExists.content] } }
    );
    // Refresh categoryExists after update if needed
    categoryExists = await mainCollection.findOne({ type: collection_type });
    categoryExists = categoryExists.data.find(d => d.category === category);
  }

  // Check if a content object with this year exists
  const yearContent = categoryExists.content.find(c => c.year === meta_data.year);

  if(yearContent) {
    // Year exists → push new images
    await mainCollection.updateOne(
      { type: collection_type, "data.category": category, "data.content.year": meta_data.year },
      { $push: { "data.$.content.$[con].image_path": { $each: meta_data.image_path } } },
      { arrayFilters: [{ "con.year": meta_data.year }] }
    );
  } else {
    // Year doesn't exist → add a new object for this year
    await mainCollection.updateOne(
      { type: collection_type, "data.category": category },
      { $push: { "data.$.content": { year: meta_data.year, zone: meta_data.zone || "", image_path: meta_data.image_path } } }
    );
  }

  return { success: true, message: `Insert successful in ${collection_type} - category ${category}` };
}


    if (categoryExists) {      
      // ✅ Append to existing category using arrayFilters
      await mainCollection.updateOne(
        { type: collection_type, "data.category": category },
        {$push: {"data.$.content": meta_data},}
      );
    } else {
      // ✅ Category not found → add new category with content
      await mainCollection.updateOne(
        { type: collection_type },
        {
          $push: {
            data: {
              category,
              content: Array.isArray(meta_data) ? meta_data : [meta_data],
            },
          },
        }
      );
    }
  } else {
    // ✅ No document exists → insert fresh
    await mainCollection.insertOne({
      type: collection_type,
      data: [
        {
          category,
          content: Array.isArray(meta_data) ? meta_data : [meta_data],
        },
      ],
    });
  }

  return {
    success: true,
    message: `Insert successful in ${collection_type} - category ${category}`,
  };
}


    // 4️⃣ Insert for Action Plan
   if (collection_type === "action_plan") {
  const normalize = (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  let doc = await mainCollection.findOne({ type: collection_type });

  if (doc) {
    // Ensure training is always an array
    if (
      doc.data &&
      doc.data[0] &&
      typeof doc.data[0].training === "string"
    ) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { "data.0.training": [doc.data[0].training] } }
      );
    }

    // Now push all new values safely
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $push: {
          "data.0.goals": {
            $each: normalize(
              Array.isArray(meta_data)
                ? meta_data.flatMap((i) => i.goals || [])
                : meta_data.goals
            ),
          },
          "data.0.health": {
            $each: normalize(
              Array.isArray(meta_data)
                ? meta_data.flatMap((i) => i.health || [])
                : meta_data.health
            ),
          },
          "data.0.facilities": {
            $each: normalize(
              Array.isArray(meta_data)
                ? meta_data.flatMap((i) => i.facilities || [])
                : meta_data.facilities
            ),
          },
          "data.0.training": {
            $each: normalize(
              Array.isArray(meta_data)
                ? meta_data.flatMap((i) => i.training || [])
                : meta_data.training
            ),
          },
        },
      }
    );
  } else {
    // If document does not exist → create new
    await mainCollection.insertOne({
      type: collection_type,
      data: [
        {
          training: normalize(meta_data.training),
          goals: normalize(meta_data.goals),
          health: normalize(meta_data.health),
          facilities: normalize(meta_data.facilities),
        },
      ],
    });
  }

  return {
    success: true,
    message: `Insert successful in ${collection_type}`,
  };
}



    // 5️⃣ No matching case
    return { success: false, error: "Invalid collection_type" };
  } catch (error) {
    console.error("❌ Error inserting data:", error);
    return { success: false, error: "Server error", details: error.message };
  }
}

module.exports = { insertData };
