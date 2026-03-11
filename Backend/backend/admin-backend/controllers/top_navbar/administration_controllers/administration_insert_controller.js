async function insertData(tempDoc, mainCollection) {

  try {
    if (!tempDoc || typeof tempDoc !== "object") throw new Error("Invalid tempDoc format.");
    const { collection_type, meta_data, category } = tempDoc;
    if (!collection_type || !meta_data) throw new Error("Type and meta_data required");


    // Find the document for the given collection_type
    let doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error(`Type '${collection_type}' does not exist. Cannot insert to non-existent collection.`);

    // Block HRHandBook and organization_chart insert
    if (collection_type === "HRHandBook" || collection_type === "organization_chart" || collection_type === "principal") {
      throw new Error(`Insert not allowed for single-object type '${collection_type}'.`);
    }


    // dean_and_association: append (no replace) to array, prevent duplicate names, require name for any link
  if (collection_type === "dean_and_association") {
  if (!Array.isArray(doc.data)) {
    throw new Error(
      `Data structure error: 'data' should be an array for '${collection_type}', got ${typeof doc.data}`
    );
  }

  if (!meta_data.name) {
    throw new Error(`meta_data.name required to append to '${collection_type}'.`);
  }

  const categoryExists = doc.data.find((c) => c.category === category);

  if (categoryExists) {
    // push member into existing category
    await mainCollection.updateOne(
      { type: collection_type, "data.category": category },
      { $push: { "data.$.members": meta_data } }
    );
  } else {
    // create new category
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $push: {
          data: {
            category: category,
            members: [meta_data]
          }
        }
      }
    );
  }

  return { success: true, message: `${collection_type} entry appended successfully` };
}

   if(collection_type === "admin_office"  || collection_type === "committee" || collection_type === "HandBook"){

    await mainCollection.updateOne(
      {type:collection_type},
      {$push:{data:meta_data}}
    );

    return{success:true, message:`The data is inserted into the ${collection_type}`}
   }

    throw new Error("Invalid collection type logic branch reached.");
  } catch (error) {
    console.error(error);
    throw { success: false, error: error.message || "Unknown error on insert" };
  }
}

module.exports = { insertData };