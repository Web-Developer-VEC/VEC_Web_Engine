const {insertFile , updateFile , deleteFile , updateOriginalData} = require('./file_handle_middleware')

function handleTempAction(insertData, updateData, deleteData) {
  return async function (req, res) {
    const { tempDoc, mainCollection, tempCollection } = req;

    try {
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
          result1=await updateOriginalData(tempDoc,tempCollection)
          break;

        case "delete":
          fileResult = await deleteFile(tempDoc, tempCollection);
          tempDoc.meta_data = fileResult.meta_data;
          console.log(tempDoc.meta_data) 
          result = await deleteData(tempDoc, mainCollection);
          break;

        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      await tempCollection.updateOne(
        { _id: tempDoc._id },
        { $set: { status: "approved" } }
      );

      return res.json({
        success: true,
        action: tempDoc.action,
        ...result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  };
}

module.exports = { handleTempAction };