async function updateData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data, original_data } = tempDoc;
  const { year, name, pdf_path } = meta_data;
  if (collection_type !== "curriculum_and_syllabus") {
    throw new Error("Incorrect collection type or route");
  }

  await mainCollection.updateOne(
    { type: collection_type },
    {
      $set: {
        "data.$[d].content.0.syllabus.$[y].docs.$[r].name": name,
        "data.$[d].content.0.syllabus.$[y].docs.$[r].pdf_path": pdf_path
      }
    },
    {
      arrayFilters: [
        { "d.category": category },
        { "y.year": year },
        { "r.name": original_data.name }
      ]
    }
  );

  return {success:true,  message: "Semester updated successfully" };
}

module.exports = { updateData };
