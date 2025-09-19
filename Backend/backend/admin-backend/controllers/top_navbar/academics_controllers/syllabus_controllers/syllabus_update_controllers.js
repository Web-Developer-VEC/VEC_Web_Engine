async function updateData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data, original_data } = tempDoc;

  if (!collection_type || !category || !meta_data || !original_data) {
    throw new Error(
      "collection_type, category, original_data and meta_data are required"
    );
  }

  if (collection_type === "curriculum_and_syllabus") {
    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc)
      throw new Error(
        `No document found for collection_type: ${collection_type}`
      );

    const categoryExist = doc.data.find((c) => c.category === category);
    if (!categoryExist) throw new Error(`Category ${category} does not exist`);

    const headingExist = categoryExist.content.find(
      (e) => e.heading === meta_data.heading
    );
    if (!headingExist)
      throw new Error(
        `heading ${meta_data.heading} does not exist in category ${category}`
      );
    for (const originalItem of original_data.syllabus) {
  const newItem = meta_data.syllabus.find(n => n.heading === meta_data.heading) || meta_data.syllabus[0];
  if (!newItem) continue;

  await mainCollection.updateOne(
    { type: collection_type },
    {
      $set: {
        "data.$[d].content.$[c].syllabus.$[r].year": newItem.year,
        "data.$[d].content.$[c].syllabus.$[r].pdf_path": newItem.pdf_path
      }
    },
    {
      arrayFilters: [
        { "d.category": category },
        { "c.heading": meta_data.heading },
        { "r.year": originalItem.year }   
      ]
    }
  );


}


    return {
      message: `syllabus data updated successfully for category ${category} and heading ${meta_data.heading}`,
    };
  }
}

module.exports = { updateData };
