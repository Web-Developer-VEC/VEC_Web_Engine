// ------------------- UPDATE -------------------
async function updateData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, original_data, meta_data } = tempDoc;

    if (!collection_type || !meta_data) {
      throw new Error("Type and meta_data required");
    }
    if (collection_type === "mous" && !category) {
      throw new Error("Category required for mous");
    }
    if (!original_data) {
      throw new Error("original_data is required for update");
    }

    // Fetch the document
    let doc = await mainCollection.findOne({ type: collection_type });
    if (!doc) throw new Error("Document with given type not found");

    if (collection_type === "mous") {
      const categoryIndex = doc.data.findIndex((c) => c.category === category);
      if (categoryIndex === -1) throw new Error("Category not found");

      // Extract S_NO and ORGANISATION_NAME from original_data
      const { S_NO, ORGANISATION_NAME } = original_data;
      if (!S_NO || !ORGANISATION_NAME) {
        throw new Error("S_NO and ORGANISATION_NAME are required in original_data");
      }

      // Normalize values for comparison
      const matchSNO = String(S_NO).trim();
      const matchOrg = ORGANISATION_NAME.trim().toLowerCase();

      // Find the index of the record to update
      const recordIndex = doc.data[categoryIndex].content.findIndex(record => {
        const recSNO = String(record.S_NO).trim();
        const recOrg = String(record.ORGANISATION_NAME).trim().toLowerCase();
        return recSNO === matchSNO && recOrg === matchOrg;
      });

      if (recordIndex === -1) {
        throw new Error("No matching record found to update");
      }

      // Keep S_NO and ORGANISATION_NAME fixed
      const updatedRecord = {
        ...doc.data[categoryIndex].content[recordIndex],
        ...meta_data,
        S_NO: doc.data[categoryIndex].content[recordIndex].S_NO,
        ORGANISATION_NAME: doc.data[categoryIndex].content[recordIndex].ORGANISATION_NAME
      };

      // Update the record
      doc.data[categoryIndex].content[recordIndex] = updatedRecord;

      // Save back to DB
      await mainCollection.updateOne(
        { type: collection_type },
        { $set: { data: doc.data } }
      );

      return { 
        success: true, 
        message: "MoU data updated successfully", 
        updatedRecord 
      };
    }

    throw new Error("Invalid collection type");
  } catch (error) {
    throw error;
  }
}

module.exports = { updateData };
