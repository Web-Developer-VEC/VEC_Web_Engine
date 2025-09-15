// ------------------- DELETE -------------------
async function deleteData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;
    if (!collection_type || !meta_data) {
      throw new Error("Type and originalData required for delete");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document of this type not found");


    // ---------- PLACEMENT TEAM ----------
    if (collection_type === "placement_team") {
      const index = doc.data.findIndex(
        (item) => item.name === meta_data.name
      );
      if (index === -1)
        throw new Error("Member not found in Placement Team");
      doc.data.splice(index, 1);
      await mainCollection.updateOne(
        { type: "placement_team" },
        { $set: { data: doc.data } }
      );
      return {
        success: true,
        message: "Placement Team member deleted successfully",
      };
    }

    // ---------- PLACEMENT DETAILS ----------
    if (collection_type === "placement_details") 
          {
            if (meta_data.key === "statistics") {
              const index = doc.data.statistics.years.findIndex(
                (item) => item.year === meta_data.year
              );
              if (index === -1) throw new Error("Year not found in statistics");
              doc.data.statistics.years.splice(index, 1);

            } else if (meta_data.key === "department_wise") {
              const index = doc.data.department_wise.years.findIndex(
                (item) => item.year === meta_data.year
              );
              if (index === -1) throw new Error("Year not found in department_wise");
              doc.data.department_wise.years.splice(index, 1);

            } else if (meta_data.key === "year_wise_pdfs") {
              const index = doc.data.year_wise_pdfs.findIndex(
                (item) => item.year === meta_data.year
              );
              if (index === -1) throw new Error("Year not found in year_wise_pdfs");
              doc.data.year_wise_pdfs.splice(index, 1);

            } else {
              throw new Error("Invalid key for placement_details delete");
            }

            await mainCollection.updateOne(
              { type: "placement_details" },
              { $set: { data: doc.data } }
            );

            return {
              success: true,
              message: "Placement Details entry deleted successfully",
            };
          }


    // ---------- ALUMINI ----------
    if (collection_type === "alumini") {
      const index = doc.data[0].alumni_image_path.findIndex(
        (img) => img === meta_data.image_path
      );
      if (index === -1) throw new Error("Alumni image not found");
      doc.data[0].alumni_image_path.splice(index, 1);
      await mainCollection.updateOne(
        { type: "alumini" },
        { $set: { data: doc.data } }
      );
      return {
        success: true,
        message: "Alumni image deleted successfully",
      };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error; // ❌ let the controller handle response
  }
}

module.exports = { deleteData };
