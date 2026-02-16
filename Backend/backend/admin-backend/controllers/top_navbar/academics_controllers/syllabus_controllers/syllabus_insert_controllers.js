async function insertData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;
  const { year, name, pdf_path } = meta_data;

  if (collection_type !== "curriculum_and_syllabus")
    throw new Error("Invalid collection type");

  const doc = await mainCollection.findOne({ type: collection_type });
  if (!doc) throw new Error("Document not found");

  const categoryData = doc.data.find(d => d.category === category);
  if (!categoryData) throw new Error("Category not found");

  const yearData = categoryData.content[0].syllabus.find(
    y => y.year === year
  );

  /* ---------------- ADD NEW YEAR ---------------- */
  if (!yearData) {
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $push: {
          "data.$[d].content.0.syllabus": {
            year,
            docs: name ? [{ name, pdf_path }] : []
          }
        }
      },
      {
        arrayFilters: [{ "d.category": category }]
      }
    );

    return { message: "New year added successfully" };
  }

  /* ---------------- DUPLICATE CHECK ---------------- */
  if (name) {
    const duplicate = yearData.docs.find(
      d => d.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicate) {
      throw new Error(`Semester "${name}" already exists in ${year}`);
    }

    /* ---------------- INSERT FILE ---------------- */
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $push: {
          "data.$[d].content.0.syllabus.$[y].docs": {
            name,
            pdf_path
          }
        }
      },
      {
        arrayFilters: [
          { "d.category": category },
          { "y.year": year }
        ]
      }
    );

    return { message: "Semester inserted successfully" };
  }

  return { message: "Nothing to insert" };
}

module.exports = { insertData };