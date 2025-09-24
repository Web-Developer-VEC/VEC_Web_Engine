const { insertFile, updateFile, deleteFile , updateOriginalData} = require("./file_handle_middleware");

function handleTempAction(insertData, updateData, deleteData) {
  return async function (req, res) {
    // Support single-doc (old) and multi-doc (new) modes
    const approvedDocs = req.approvedDocs || [
      {
        tempDoc: req.tempDoc,
        mainCollection: req.mainCollection,
        tempCollection: req.tempCollection,
      },
    ];

    const results = [];

    try {
      for (const { tempDoc, mainCollection, tempCollection } of approvedDocs) {
        let result;
        let fileResult;

        switch (tempDoc.action) {
          case "insert":
            fileResult = await insertFile(tempDoc, tempCollection);
            tempDoc.meta_data = fileResult.meta_data;
            result = await insertData(tempDoc, mainCollection);
            break;

          case "update":
            fileResult = await updateFile(tempDoc, tempCollection);
            tempDoc.meta_data = fileResult.meta_data;
            result = await updateData(tempDoc, mainCollection);
            result1 = await updateOriginalData(tempDoc,tempCollection)
            break;

          case "delete":
            let deletetemp =  structuredClone(tempDoc); // its to send the original data with old path for deletion
            fileResult = await deleteFile(tempDoc, tempCollection);
            tempDoc.meta_data = fileResult.meta_data;
            result = await deleteData(deletetemp, mainCollection);
            break;

          default:
            results.push({ id: tempDoc._id, error: "Invalid action" });
            continue;
        }

        // Mark request as approved in temp collection
        await tempCollection.updateOne(
          { _id: tempDoc._id },
          { $set: { status: "approved" } }
        );

        results.push({
          id: tempDoc._id,
          success: true,
          action: tempDoc.action,
          ...result,
        });
      }

      return res.json({
        success: true,
        results,
        bulkResults: req.bulkResults || undefined, // optional summary from middleware
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  };
}

module.exports = { handleTempAction };