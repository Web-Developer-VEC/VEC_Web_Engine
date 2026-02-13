async function deleteData(tempDoc, mainCollection) {
  const { collection_type, category, meta_data } = tempDoc;
  const { year, name } = meta_data;

  if (!name) {
    /* -------- DELETE ENTIRE YEAR -------- */
    await mainCollection.updateOne(
      { type: collection_type },
      {
        $pull: {
          "data.$[d].content.0.syllabus": {
            year: year
          }
        }
      },
      {
        arrayFilters: [{ "d.category": category }]
      }
    );

    return { message: "Year deleted successfully" };
  }

  /* -------- DELETE SEMESTER -------- */
  await mainCollection.updateOne(
    { type: collection_type },
    {
      $pull: {
        "data.$[d].content.0.syllabus.$[y].docs": {
          name: name
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

  return { message: "Semester file deleted successfully" };
}

module.exports = { deleteData };