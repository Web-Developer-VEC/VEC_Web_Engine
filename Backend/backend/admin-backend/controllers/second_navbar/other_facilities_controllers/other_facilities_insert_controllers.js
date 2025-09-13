async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category, and meta_data are required");
  }

  // Normalize values
  const filePaths = meta_data.image_path
    ? (Array.isArray(meta_data.image_path) ? meta_data.image_path : [meta_data.image_path])
    : [];

  const names = meta_data.name
    ? (Array.isArray(meta_data.name) ? meta_data.name : [meta_data.name])
    : [];

  const descriptions = meta_data.description
    ? (Array.isArray(meta_data.description) ? meta_data.description : [meta_data.description])
    : [];

  // Collapse helper (string if one, array if more than one)
  const collapse = (arr) => {
    if (!arr || arr.length === 0) return undefined;
    return arr.length === 1 ? arr[0] : arr;
  };

  const existingDoc = await mainCollection.findOne({ type: collection_type });

  if (!existingDoc) {
    // Create new collection type + category
    await mainCollection.insertOne({
      type: collection_type,
      data: [{
        category,
        name: collapse(names),
        description: collapse(descriptions),
        image_path: filePaths
      }]
    });
    return { created: true, message: "New type and category created" };
  }

  // Check if category already exists
  const categoryIndex = existingDoc.data.findIndex(c => c.category === category);

  if (categoryIndex === -1) {
    // Add new category
    existingDoc.data.push({
      category,
      name: collapse(names),
      description: collapse(descriptions),
      image_path: filePaths
    });
  } else {
    // Merge into existing category
    const cat = existingDoc.data[categoryIndex];

    if (names.length > 0) {
      let existingNames = Array.isArray(cat.name) ? cat.name : (cat.name ? [cat.name] : []);
      cat.name = collapse(Array.from(new Set([...existingNames, ...names])));
    }

    if (descriptions.length > 0) {
      let existingDesc = Array.isArray(cat.description) ? cat.description : (cat.description ? [cat.description] : []);
      cat.description = collapse(Array.from(new Set([...existingDesc, ...descriptions])));
    }

    if (filePaths.length > 0) {
      let existingImages = Array.isArray(cat.image_path) ? cat.image_path : (cat.image_path ? [cat.image_path] : []);
      cat.image_path = Array.from(new Set([...existingImages, ...filePaths]));
    }
  }

  await mainCollection.updateOne(
    { type: collection_type },
    { $set: { data: existingDoc.data } }
  );

  return { created: false, message: "Data inserted successfully" };
}

module.exports = { insertData };