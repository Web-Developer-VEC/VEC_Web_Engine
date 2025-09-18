

async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data, category } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Type, newData and originalData required");
    }

    // Handle image path normalization
    if (meta_data?.filePaths) {
      meta_data.image_path = meta_data.filePaths;
      delete meta_data.filePaths;
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Type not found");

    // ---------- ADMISSIONS (UG/PG/MBA) ----------
    if (
      ["ug", "pg", "mba", "admissions", "addmissions"].includes(collection_type)
    ) {
      // The actual data is inside doc.data, and is an object with { year, UG/PG/MBA: [...] }
      const { data } = doc;

      // --- [NEW]: Allow updating just the year field ---
      if (
        meta_data?.data &&
        Object.keys(meta_data.data).length === 1 &&
        meta_data.data.year &&
        original_data?.data &&
        data.year === original_data.data.year
      ) {
        await mainCollection.updateOne(
          { type: collection_type, "data.year": original_data.data.year },
          { $set: { "data.year": meta_data.data.year } }
        );
        return {
          success: true,
          message: "Admissions year updated successfully",
          data: { year: meta_data.data.year }
        };
      }
      // --- [END NEW] ---

      const { year } = meta_data.data;
      let arrayKey = null;

      if (collection_type === "ug" && meta_data.data.UG) arrayKey = "UG";
      else if (collection_type === "pg" && meta_data.data.PG) arrayKey = "PG";
      else if (collection_type === "mba" && meta_data.data.MBA) arrayKey = "MBA";
      else if (meta_data.data.UG) arrayKey = "UG";
      else if (meta_data.data.PG) arrayKey = "PG";
      else if (meta_data.data.MBA) arrayKey = "MBA";

      if (!data || data.year !== year || (arrayKey && !Array.isArray(data[arrayKey]))) {
        throw new Error("Admissions year or structure not found");
      }

      // Map and update items in the array (UG/PG/MBA)
      if (arrayKey) {
        let updatedArr = data[arrayKey].map((item) => {
          const key = Object.keys(item)[0];

          // Find a match in updated data from meta_data
          const updateObj = (meta_data.data[arrayKey] || []).find(
            (uObj) => Object.keys(uObj)[0] === key
          );
          if (!updateObj) return item;
          return {
            [key]: {
              ...item[key],
              ...updateObj[key],
            },
          };
        });

        // Optionally add new departments present in meta_data but not in existing data
        (meta_data.data[arrayKey] || []).forEach((uObj) => {
          const key = Object.keys(uObj)[0];
          if (!updatedArr.some((item) => Object.keys(item)[0] === key)) {
            updatedArr.push(uObj);
          }
        });

        await mainCollection.updateOne(
          { type: collection_type, "data.year": year },
          { $set: { [`data.${arrayKey}`]: updatedArr } }
        );

        return {
          success: true,
          message: `Admissions ${arrayKey} data updated successfully`,
          data: { year, [arrayKey]: updatedArr },
        };
      } else {
        // Only year present, handled above; otherwise, nothing to do
        throw new Error("Admissions structure not found");
      }
    }

    // ---------- ADMISSION TEAM ----------
    if (collection_type === "admission_team") {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );

      if (index === -1) throw new Error("Admission team member not found");

      doc.data[index] = { ...doc.data[index], ...meta_data };

      await mainCollection.updateOne(
        { type: "admission_team" },
        { $set: { data: doc.data } }
      );

      return { success: true, message: "Admission team member updated successfully", data: doc.data[index] };
    }

    // ---------- PHD ----------
    if (collection_type === "phd") {
      // Only one object in data; just update fields that match original_data
      if (
        doc.data &&
        Object.keys(original_data).every((k) => doc.data[k] === original_data[k])
      ) {
        doc.data = { ...doc.data, ...meta_data };
        await mainCollection.updateOne(
          { type: "phd" },
          { $set: { data: doc.data } }
        );
        return { success: true, message: "PhD data updated successfully", data: doc.data };
      } else {
        throw new Error("PhD data not found");
      }
    }

    // ---------- GENERIC FALLBACK: Map by all fields ----------
    // For any other collection, attempt to deeply match and update any object in doc.data or doc.data[]
    // Handles both object and array of objects
    let updated = false;
    if (Array.isArray(doc.data)) {
      const index = doc.data.findIndex((item) =>
        Object.keys(original_data).every((k) => item[k] === original_data[k])
      );
      if (index !== -1) {
        doc.data[index] = { ...doc.data[index], ...meta_data };
        updated = true;
      }
    } else if (typeof doc.data === "object") {
      const allKeysMatch = Object.keys(original_data).every(
        (k) => doc.data[k] === original_data[k]
      );
      if (allKeysMatch) {
        doc.data = { ...doc.data, ...meta_data };
        updated = true;
      }
    }
    if (updated) {
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data } }
      );
      return { success: true, message: "Data updated successfully (generic handler)" };
    }

    throw new Error("Invalid collection type or data to update not found");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { updateData };