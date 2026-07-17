async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !category || !original_data) {
      throw new Error(
        "collection_type, category, meta_data, and original_data are required"
      );
    }

    if (collection_type !== "newsletter" || category !== "newsletter") {
      throw new Error("Incorrect collection type or category");
    }

    // Get current document
    const doc = await mainCollection.findOne({ type: collection_type });

    const newsletter = doc.data.find(
      (d) => d.category === "newsletter"
    );

    const content = newsletter.content.find(
      (c) => c.year === original_data.year
    );

    if (!content) {
      throw new Error("Newsletter entry not found");
    }

    // Clone existing array
    const current = [...content.pdf_path];

    // Replace only changed PDFs
    original_data.pdf_path.forEach((oldPath, i) => {
      const oldName = oldPath.split("/").pop();

      const index = current.findIndex(
        (p) => p.split("/").pop() === oldName
      );

      if (index !== -1 && meta_data.pdf_path[i]) {
        current[index] = meta_data.pdf_path[i];
      }
    });

    await mainCollection.updateOne(
      { type: collection_type },
      {
        $set: {
          "data.$[cat].content.$[cont].pdf_path": current
        }
      },
      {
        arrayFilters: [
          { "cat.category": "newsletter" },
          { "cont.year": original_data.year }
        ]
      }
    );

    return {
      success: true,
      message: `The data is updated successfully in ${collection_type}`
    };

  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
}
module.exports = { updateData };
