async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, meta_data, original_data } = tempDoc;

    if (!collection_type || !meta_data || !original_data) {
      throw new Error("Type, newData and originalData required");
    }

    // ---------- IMAGE PATH NORMALIZATION ----------
    if (meta_data?.filePaths) {
      meta_data.image_path = meta_data.filePaths;
      delete meta_data.filePaths;
    }

    if (meta_data?.photo_path) {
      meta_data.image_path = meta_data.photo_path;
      delete meta_data.photo_path;
    }

    if (original_data?.photo_path) {
      original_data.image_path = original_data.photo_path;
      delete original_data.photo_path;
    }

    const doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Type not found");

    // =================================================
    // ========== ADMISSIONS (UG / PG / MBA) ===========
    // =================================================
    if (["ug", "pg", "mba", "admissions", "addmissions"].includes(collection_type)) {

      const { data } = doc;
      const newData = meta_data.data || meta_data;

      // -------------------------------------------------
      // GLOBAL YEAR UPDATE
      // -------------------------------------------------
      if (newData.year && data.year !== newData.year) {
        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { "data.year": newData.year } }
        );

        data.year = newData.year;
      }

      // -------------------------------------------------
      // QUOTA LINK NAME UPDATE (NO pdf_path update)
      // -------------------------------------------------
      if (
        !meta_data?.data &&
        (
          meta_data?.BE_Government ||
          meta_data?.BE_Management ||
          meta_data?.MBA_Government ||
          meta_data?.MBA_Management
        )
      ) {

        let quotaKey = null;

        if (collection_type === "ug") {
          quotaKey = meta_data.BE_Government
            ? "BE_Government"
            : meta_data.BE_Management
              ? "BE_Management"
              : null;
        }

        if (collection_type === "mba") {
          quotaKey = meta_data.MBA_Government
            ? "MBA_Government"
            : meta_data.MBA_Management
              ? "MBA_Management"
              : null;
        }

        if (!quotaKey) {
          throw new Error("Quota updates allowed only for UG and MBA");
        }

        const quotaData = meta_data[quotaKey];

        // detect link name key dynamically
        const linkNameKey = Object.keys(quotaData).find(k =>
          k.includes("link_name")
        );

        const updateObj = {};

        if (linkNameKey) {
          updateObj[`data.${quotaKey}.${linkNameKey}`] = quotaData[linkNameKey];
        }

        if (quotaData.pdf_path) {
          updateObj[`data.${quotaKey}.pdf_path`] = quotaData.pdf_path;
        }

        if (newData.year) {
          updateObj["data.year"] = newData.year;
        }

        await mainCollection.updateOne(
          { type: collection_type },
          { $set: updateObj }
        );
        return {
          success: true,
          message: `${quotaKey} link updated successfully`,
          data: updateObj
        };
      }

      // -------------------------------------------------
      // INTAKE UPDATE
      // -------------------------------------------------

      const year = newData.year;
      if (!year) {
        throw new Error("Admissions year is required");
      }

      let arrayKey = null;

      if (collection_type === "ug" && newData.UG) arrayKey = "UG";
      else if (collection_type === "ug" && newData.UG_Lateral) arrayKey = "UG_Lateral";
      else if (collection_type === "pg" && newData.PG) arrayKey = "PG";
      else if (collection_type === "mba" && newData.MBA) arrayKey = "MBA";
      else if (newData.UG) arrayKey = "UG";
      else if (newData.UG_Lateral) arrayKey = "UG_Lateral";
      else if (newData.PG) arrayKey = "PG";
      else if (newData.MBA) arrayKey = "MBA";

      if (!arrayKey || !data[arrayKey]) {
        throw new Error("Admissions structure not found");
      }

      // =========================
      // MBA OBJECT STRUCTURE
      // =========================
      if (collection_type === "mba" && typeof data[arrayKey] === "object") {

        const updatedMBA = {
          ...data[arrayKey],
          ...newData[arrayKey]
        };

        await mainCollection.updateOne(
          { type: collection_type },
          { $set: { [`data.${arrayKey}`]: updatedMBA } }
        );

        return {
          success: true,
          message: "MBA admission data updated successfully",
          data: { year, MBA: updatedMBA },
        };
      }

      // =========================
      // ARRAY STRUCTURE (UG / PG / UG_Lateral)
      // =========================

      if (!Array.isArray(data[arrayKey])) {
        throw new Error("Admissions structure not found");
      }

      newData[arrayKey].forEach(obj => {
        const name = Object.keys(obj)[0];
        if (!name || name.length < 3) {
          throw new Error(`Invalid department name: ${name}`);
        }
      });

      let updatedArr = data[arrayKey].map(item => {

        const key = Object.keys(item)[0];

        const updateObj = newData[arrayKey].find(
          uObj => Object.keys(uObj)[0] === key
        );

        if (!updateObj) return item;

        return {
          [key]: {
            ...item[key],
            ...updateObj[key],
          },
        };
      });

      newData[arrayKey].forEach(uObj => {

        const key = Object.keys(uObj)[0];

        if (!updatedArr.some(item => Object.keys(item)[0] === key)) {
          updatedArr.push(uObj);
        }
      });

      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { [`data.${arrayKey}`]: updatedArr } }
      );

      return {
        success: true,
        message: `Admissions ${arrayKey} data updated successfully`,
        data: { year, [arrayKey]: updatedArr },
      };
    }

    // =================================================
    // GENERIC FALLBACK
    // =================================================

    let updated = false;

    if (Array.isArray(doc.data)) {

      const index = doc.data.findIndex(item =>
        Object.keys(original_data).every(k => item[k] === original_data[k])
      );

      if (index !== -1) {
        doc.data[index] = { ...doc.data[index], ...meta_data };
        updated = true;
      }

    } else if (typeof doc.data === "object") {

      const allKeysMatch = Object.keys(original_data).every(
        k => doc.data[k] === original_data[k]
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

      return {
        success: true,
        message: "Data updated successfully (generic handler)",
      };
    }

    throw new Error("Invalid collection type or data to update not found");

  } catch (error) {

    console.error("Update error:", error);
    throw error;
  }
}

module.exports = { updateData };