// ------------------- UPDATE (PLACEMENT) -------------------
async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Type, meta_data, and original_data required");
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document of this type not found");

    // ---------- ABOUT PLACEMENT ----------
    if (collection_type === "about_placement") {
      doc.data = { ...doc.data, ...meta_data };

      await mainCollection.updateOne(
        { type: "about_placement" },
        { $set: { data: doc.data } }
      );

      return {
        success: true,
        message: "About Placement updated successfully",
        data: doc.data,
      };
    }

    // ---------- PLACEMENT TEAM ----------
    if (collection_type === "placement_team") {
      const index = doc.data.findIndex(
        (item) => item.name === original_data.name
      );
      if (index === -1)
        throw new Error("Team member not found in Placement Team");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "placement_team" },
        { $set: { data: doc.data } }
      );

      return {
        success: true,
        message: "Placement Team updated successfully",
        data: doc.data[index],
      };
    }

    // ---------- PLACEMENT DETAILS (Statistics - Year wise) ----------
    if (collection_type === "placement_details") {
      // Update statistics -> years
      if (original_data.section === "statistics") {
        const index = doc.data.statistics.years.findIndex(
          (item) => item.year === original_data.year
        );
        if (index === -1)
          throw new Error("Year not found in Placement Statistics");

        doc.data.statistics.years[index] = {
          ...doc.data.statistics.years[index],
          ...meta_data,
        };

        await mainCollection.updateOne(
          { type: "placement_details" },
          { $set: { data: doc.data } }
        );

        return {
          success: true,
          message: "Placement Statistics updated successfully",
          data: doc.data.statistics.years[index],
        };
      }

      if (
        collection_type === "placement_details" &&
        action === "update" &&
        meta_data?.particulars
      ) {
        await mainCollection.updateOne(
          { type: "placement_details" },
          {
            $set: {
              "data.statistics.particulars": meta_data.particulars,
            },
          }
        );

        return {
          success: true,
          message: "Statistics particulars overwritten successfully",
          data: meta_data.particulars,
        };
      }
      if (
        collection_type === "placement_details" &&
        action === "update" &&
        meta_data?.departments
      ) {
        await mainCollection.updateOne(
          { type: "placement_details" },
          {
            $set: {
              "data.department_wise.departments": meta_data.departments,
            },
          }
        );

        return {
          success: true,
          message: "Departments overwritten successfully",
          data: meta_data.departments,
        };
      }

      // Update department-wise -> years
      if (original_data.section === "department_wise") {
        const index = doc.data.department_wise.years.findIndex(
          (item) => item.year === original_data.year
        );
        if (index === -1)
          throw new Error("Year not found in Department Wise Placement");

        doc.data.department_wise.years[index] = {
          ...doc.data.department_wise.years[index],
          ...meta_data,
        };

        await mainCollection.updateOne(
          { type: "placement_details" },
          { $set: { data: doc.data } }
        );

        return {
          success: true,
          message: "Department Wise Placement updated successfully",
          data: doc.data.department_wise.years[index],
        };
      }

      // Update year-wise PDFs
      if (original_data.section === "year_wise_pdfs") {
        const index = doc.data.year_wise_pdfs.findIndex(
          (item) => item.year === original_data.year
        );
        if (index === -1)
          throw new Error("PDF Year not found in Year Wise PDFs");

        doc.data.year_wise_pdfs[index] = {
          ...doc.data.year_wise_pdfs[index],
          ...meta_data,
        };

        await mainCollection.updateOne(
          { type: "placement_details" },
          { $set: { data: doc.data } }
        );

        return {
          success: true,
          message: "Year Wise PDF updated successfully",
          data: doc.data.year_wise_pdfs[index],
        };
      }
    }

    // ---------- ALUMNI ----------
    if (collection_type === "alumini") {
      const index = doc.data[0].alumni_image_path.findIndex(
        (item) => item === original_data.alumni_image_path
      );
      if (index === -1) throw new Error("Alumni image not found");

      doc.data[0].alumni_image_path[index] = meta_data.alumni_image_path;

      await mainCollection.updateOne(
        { type: "alumini" },
        { $set: { data: doc.data } }
      );

      return {
        success: true,
        message: "Alumni updated successfully",
        data: doc.data[0].alumni_image_path[index],
      };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { updateData };
