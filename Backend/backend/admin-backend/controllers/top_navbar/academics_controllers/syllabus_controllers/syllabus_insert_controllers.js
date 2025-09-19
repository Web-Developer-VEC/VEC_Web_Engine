async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }

  if (collection_type == "curriculum_and_syllabus") {
    const doc = await mainCollection.findOne({ type: collection_type });

    const categoryExist = doc.data.find((c) => c.category === category);


    if (categoryExist) {
      const headingExist = categoryExist.content.find(
        (e) => e.heading === meta_data.heading
      );

      if (headingExist) {
        await mainCollection.updateOne(
          { type: collection_type },
          {$push:{ "data.$[d].content.$[c].syllabus":{$each: meta_data.syllabus} }},
          {arrayFilters: [{ "d.category": category },{ "c.heading": meta_data.heading }]}
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
