async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;

  if (!collection_type || !category || !meta_data) {
    throw new Error("collection_type, category and meta_data are required");
  }

  if (collection_type === "curriculum_and_syllabus") {
    // If meta_data is empty, remove entire category
    if (meta_data && Object.keys(meta_data).length === 0) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $pull: { data: { category: category } } }
      );
      return { message: `Category ${category} deleted successfully` };
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error(`No document found for collection_type: ${collection_type}`);

    const categoryExist = doc.data.find((c) => c.category === category);
    if (!categoryExist) throw new Error(`Category ${category} does not exist`);

    const headingExist = categoryExist.content.find((e) => e.heading === meta_data.heading);
    if (!headingExist) throw new Error(`heading ${meta_data.heading} does not exist in category ${category}`);

    // Prepare syllabus delete conditions
    const syllabusConditions = meta_data.syllabus.map((s) => ({
      year: s.year,
      pdf_path: s.pdf_path
    }));

    // Delete syllabus items
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $pull: {
          "data.$[d].content.$[c].syllabus": { $or: syllabusConditions }
        }
      },
      {
        arrayFilters: [
          { "d.category": category },
          { "c.heading": meta_data.heading }
        ]
      }
    );

    return {
      message: `syllabus data deleted successfully for category ${category} and heading ${meta_data.heading}`,
    };
  }
}

module.exports = { deleteData };
