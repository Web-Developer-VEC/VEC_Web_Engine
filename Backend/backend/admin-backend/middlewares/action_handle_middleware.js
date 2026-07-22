const { insertFile, updateFile, deleteFile , updateOriginalData, revertInsertFile, revertUpdateFile, revertDeleteFile } = require("./file_handle_middleware");

function handleTempAction(insertData, updateData, deleteData) {
  return async function (req, res) {

    const approvedDocs = req.approvedDocs || [
      {
        tempDoc: req.tempDoc,
        mainCollection: req.mainCollection,
        tempCollection: req.tempCollection,
      },
    ];

    const trueResults = [];
    const falseResults = [];


    try {
      for (const { tempDoc, mainCollection, tempCollection , status } of approvedDocs) {
        let result;
        let fileResult;
        let revertfile;

        if (status === "rejected") {
  try {
    await tempCollection.updateOne(
      { _id: tempDoc._id },
      { $set: { status: "rejected" } }
    );

    trueResults.push({
      id: tempDoc._id,
      action: "rejected",
      success: true,
    });
  } catch (err) {
    falseResults.push({
      id: tempDoc._id,
      action: "rejected",
      success: false,
      error: err.message,
    });
  }

  continue;
}

        switch (tempDoc.action) {
          case "insert":
            fileResult = await insertFile(tempDoc, tempCollection);
            console.log("fileResult insert",fileResult.success)

            if (fileResult?.success === false) {
              console.log("false case break")
              result = fileResult;
              break;
            }

            tempDoc.meta_data = fileResult.meta_data;
            result = await insertData(tempDoc, mainCollection);

            if(!result || result.success === false){
              revertfile = await revertInsertFile(tempDoc, tempCollection);
              console.log("file reverted successfully",revertfile.success)
            }else{
               // Mark request as approved
              await tempCollection.updateOne(
                { _id: tempDoc._id },
                { $set: { status: "approved" } }
              );
            }
            break;

          case "update":
            fileResult = await updateFile(tempDoc, tempCollection);
            console.log("fileResult update",fileResult.success)

            if (fileResult?.success === false) {
              console.log("false case break")
              result = fileResult;
              break;
            }

            tempDoc.meta_data = fileResult.meta_data;
            result = await updateData(tempDoc, mainCollection);
            
            if(!result || result.success === false){
              revertfile = await revertUpdateFile(tempDoc, tempCollection);
              console.log("file reverted successfully",revertfile.success)
            }else{
              await updateOriginalData(tempDoc, tempCollection);
              await tempCollection.updateOne(
                { _id: tempDoc._id },
                { $set: { status: "approved" } }
              );
            }
            break;

          case "delete":
            const deletetemp = structuredClone(tempDoc);

            fileResult = await deleteFile(tempDoc, tempCollection);
            console.log("fileResult delete",fileResult.success)

            if (fileResult?.success === false) {
              result = fileResult;
              console.log("false case break")
              break;
            }

            tempDoc.meta_data = fileResult.meta_data;
            result = await deleteData(deletetemp, mainCollection);

            if(!result || result.success === false){
              revertfile = await revertDeleteFile(tempDoc, tempCollection);
              console.log("file reverted successfully",revertfile.success)
            }else{
              await tempCollection.updateOne(
                { _id: tempDoc._id },
                { $set: { status: "approved" } }
              );
            }
            break;

          default:
            falseResults.push({
              id: tempDoc._id,
              error: "Invalid action",
            });
            continue;
        }

        const formattedResult = {
          id: tempDoc._id,
          action: tempDoc.action,
          ...result,
        };

        // 🔥 Split based on success
        if (result?.success === false) {
          falseResults.push(formattedResult);
        } else {
          trueResults.push(formattedResult);
        }
      }

      // if (falseResults.length && trueResults.length) {
      //   return res.status(207).json({ trueResults, falseResults });
      // }

      // if (falseResults.length) {
      //   return res.status(400).json({ trueResults, falseResults });
      // }

      // return res.status(200).json({ trueResults, falseResults });

      
      return res.json({
        trueResults,
        falseResults,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

module.exports = { handleTempAction };