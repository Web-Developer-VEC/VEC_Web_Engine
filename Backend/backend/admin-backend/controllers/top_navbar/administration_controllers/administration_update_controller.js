async function updateData(tempDoc, mainCollection) {

  try {
    if (!tempDoc || typeof tempDoc !== "object") throw new Error("Invalid tempDoc format.");
    
    const { collection_type, meta_data, category, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) throw new Error("Type and meta_data and original_data required");

    // Allowed types
    const update = ["principal","HRHandBook","organization_chart"]

    // Find the document for the given collection_type
    let doc = await mainCollection.findOne({ type: collection_type });

    if (!doc) throw new Error(`Type '${collection_type}' does not exist. Cannot insert to non-existent collection.`);

    // Block HRHandBook and organization_chart insert
    if (update.includes(collection_type)) {
      await mainCollection.updateOne(
        {type:collection_type},
        {$set:{data:meta_data}}
      );

      return{message:`The data is updated in the ${collection_type}`}
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
      if (categoryExists){
        await mainCollection.updateOne(
          {type:collection_type, "data.category": category},
          {$set:{"data.$[elem].members.$[con]":meta_data}},
          {arrayFilters:[{"elem.category":category},{"con.name":original_data.name}]}
        )
      }
      return { success: true, message: `${collection_type} entry updated successfully` };
    }

   if(collection_type === "admin_office"  || collection_type === "committee"){

    await mainCollection.updateOne(
      {type:collection_type},
      {$set:{"data.$[elem]":meta_data}},
      {arrayFilters:[{"elem.name":original_data.name}]}
    );

    return{message:`The data is updated into the ${collection_type}`}
   }
   else if(collection_type === "HandBook" ){

    await mainCollection.updateOne(
      {type:collection_type},
      {$set:{"data.$[elem]":meta_data}},
      {arrayFilters:[{"elem.year":original_data.year}]}
    );

    return{message:`The data is updated into the ${collection_type}`}
   }

    throw new Error("Invalid collection type logic branch reached.");
  } catch (error) {
    console.error(error);
    throw { success: false, error: error.message || "Unknown error on insert" };
  }
}

module.exports = { updateData };