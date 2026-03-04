async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, action, meta_data, original_data } = tempDoc;

    if (!collection_type || meta_data === undefined || meta_data === null) {
      throw new Error("collection_type and meta_data are required");
    }

    if (action && action !== "update") {
      throw new Error("This function only handles 'update' action");
    }

    const key = String(collection_type).toUpperCase();

    if (!["HOD", "FACULTY", "NON_TEACHING_FACULTY", "FACULTY_PDF_PATH"].includes(key)) {
      throw new Error(`Invalid collection_type: ${collection_type}`);
    }

    const doc = await mainCollection.findOne({ type: key });
    if (!doc) {
      throw new Error(`Document with type '${key}' not found`);
    }

    // Faculty list PDF path update
    if (key === "FACULTY_PDF_PATH") {
      let pdfPath = meta_data?.pdf_path;
      if (Array.isArray(pdfPath)) {
        pdfPath = pdfPath[0] || "";
      }

      if (!pdfPath) {
        throw new Error("meta_data.pdf_path is required for FACULTY_PDF_PATH update");
      }

      const result = await mainCollection.updateOne(
        { type: key },
        { $set: { data: [{ pdf_path: pdfPath }] } }
      );

      return {
        success: true,
        message: "FACULTY_PDF_PATH updated successfully",
        type: key,
        modifiedCount: result.modifiedCount,
      };
    }

    // Faculty list bulk update payload support
    if (
      key === "FACULTY" &&
      meta_data &&
      typeof meta_data === "object" &&
      !Array.isArray(meta_data) &&
      Array.isArray(meta_data.faculty_list)
    ) {
      const result = await mainCollection.updateOne(
        { type: key },
        { $set: { data: meta_data.faculty_list } }
      );

      return {
        success: true,
        message: "FACULTY list updated successfully",
        type: key,
        modifiedCount: result.modifiedCount,
      };
    }

    // Section clear
    if (Array.isArray(meta_data) && meta_data.length === 0) {
      const result = await mainCollection.updateOne(
        { type: key },
        { $set: { data: [] } }
      );

      return {
        success: true,
        message: `${key} section cleared successfully`,
        modifiedCount: result.modifiedCount,
      };
    }

    if (!original_data || !original_data.name) {
      throw new Error("original_data with name is required to identify the member");
    }

    const data = Array.isArray(doc.data) ? doc.data : [];
    const originalName = original_data.name || "";
    const originalMail = original_data.mail_id || "";
    const originalUniqueId = original_data.unique_id || "";

    const memberIndex = data.findIndex((member) => {
      const memberUniqueId = member.unique_id || "";
      if (originalUniqueId && memberUniqueId) {
        return memberUniqueId === originalUniqueId;
      }

      if (key === "HOD") {
        return member.name === originalName;
      }

      if (originalMail) {
        return member.name === originalName && member.mail_id === originalMail;
      }

      return member.name === originalName;
    });

    if (memberIndex === -1) {
      throw new Error(`${key} member "${original_data.name}" not found in the data array`);
    }

    const updatedData = [...data];
    updatedData[memberIndex] = meta_data;

    const result = await mainCollection.updateOne(
      { type: key },
      { $set: { data: updatedData } }
    );

    const memberName = meta_data.name || original_data.name;

    return {
      success: true,
      message: `${key} member "${memberName}" updated successfully`,
      type: key,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error in updateData:", error);
    throw error;
  }
}

module.exports = { updateData };
