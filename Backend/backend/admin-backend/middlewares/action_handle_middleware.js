const { insertFile, updateFile, deleteFile , updateOriginalData } = require("./file_handle_middleware");

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
      for (const { tempDoc, mainCollection, tempCollection } of approvedDocs) {
        let result;
        let fileResult;

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
            await updateOriginalData(tempDoc, tempCollection);
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
            break;

          default:
            falseResults.push({
              id: tempDoc._id,
              error: "Invalid action",
            });
            continue;
        }

        // Mark request as approved
        await tempCollection.updateOne(
          { _id: tempDoc._id },
          { $set: { status: "approved" } }
        );

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