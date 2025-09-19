async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }

  if (collection_type == "pedagogy") {
    const doc = await mainCollection.findOne({ type: collection_type });

    const categoryExist = doc.data.find((c) => c.category === category);


    if (categoryExist) {
      const yearExist = categoryExist.content.find(
        (e) => e.year === meta_data.year
      );

    const insert = Array.isArray(meta_data.content)?meta_data.content:[meta_data.content];

      if (yearExist) {
        await mainCollection.updateOne(
          { type: collection_type },
          {$push:{ "data.$[d].content.$[c].content":{$each: insert} }},
          {arrayFilters: [{ "d.category": category },{ "c.year": meta_data.year }]}
        );
      }

      return{message:`the insertion is successfully done for ${category} `}
    } else {

     await mainCollection.updateOne(
    { type: collection_type },
    { $push: { data: { category, content: [meta_data] } } }
    );

    }
  }
}

module.exports = { insertData };
