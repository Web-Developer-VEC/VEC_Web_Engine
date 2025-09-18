// ------------------- INSERT (PLACEMENT & ALUMNI) -------------------
async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data } = tempDoc;
    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }

    let doc = await mainCollection.findOne({ type: collection_type });

    // ---------- ABOUT PLACEMENT ----------
    if (collection_type === "about_placement") {
      if (doc) {
        const updatedData = { ...doc.data };

        if (meta_data.Training_Placement_Department) {
          updatedData.Training_Placement_Department = [
            ...(doc.data.Training_Placement_Department || []),
            ...meta_data.Training_Placement_Department
          ];
        }

        if (meta_data.phone) {
          updatedData.phone = [...(doc.data.phone || []), ...meta_data.phone];
        }

        if (meta_data.Our_Vision) updatedData.Our_Vision = meta_data.Our_Vision;
        if (meta_data.Our_Mission) updatedData.Our_Mission = meta_data.Our_Mission;
        if (meta_data.email) updatedData.email = meta_data.email;

        await mainCollection.updateOne(
          { type: "about_placement" },
          { $set: { data: updatedData } }
        );
      } else {
        await mainCollection.insertOne({
          type: "about_placement",
          data: meta_data,
        });
      }
      return { success: true, message: "About Placement data inserted successfully" };
    }

    // ---------- PLACEMENT TEAM ----------
    if (collection_type === "placement_team") {
      if (doc) {
        await mainCollection.updateOne(
          { type: "placement_team" },
          { $push: { data: { $each: Array.isArray(meta_data) ? meta_data : [meta_data] } } }
        );
      } else {
        await mainCollection.insertOne({
          type: "placement_team",
          data: Array.isArray(meta_data) ? meta_data : [meta_data],
        });
      }
      return { success: true, message: "Placement Team data inserted successfully" };
    }

    // ---------- PLACEMENT DETAILS ----------
    if (collection_type === "placement_details") {
      if (doc) {
        const updatedData = { ...doc.data };

        // Append statistics years
        if (meta_data.statistics && meta_data.statistics.years) {
          updatedData.statistics.years = [
            ...(doc.data.statistics.years || []),
            ...meta_data.statistics.years
          ];
        }

        // Append department_wise years
        if (meta_data.department_wise && meta_data.department_wise.years) {
          updatedData.department_wise.years = [
            ...(doc.data.department_wise.years || []),
            ...meta_data.department_wise.years
          ];
        }

        // Append year_wise_pdfs
        if (meta_data.year_wise_pdfs) {
          updatedData.year_wise_pdfs = [
            ...(doc.data.year_wise_pdfs || []),
            ...meta_data.year_wise_pdfs
          ];
        }

        await mainCollection.updateOne(
          { type: "placement_details" },
          { $set: { data: updatedData } }
        );
      } else {
        await mainCollection.insertOne({
          type: "placement_details",
          data: meta_data,
        });
      }
      return { success: true, message: "Placement Details data inserted successfully" };
    }

    // ---------- ALUMINI ----------
    if (collection_type === "alumini") {
      if (doc) {
        // Append to alumni image array
        if (meta_data[0]?.alumni_image_path) {
          doc.data[0].alumni_image_path.push(...meta_data[0].alumni_image_path);
        }
        await mainCollection.updateOne(
          { type: "alumini" },
          { $set: { data: doc.data } }
        );
      } else {
        await mainCollection.insertOne({
          type: "alumini",
          data: meta_data,
        });
      }
      return { success: true, message: "Alumni data inserted successfully" };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { insertData };
