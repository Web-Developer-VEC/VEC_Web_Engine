function handleTempAction(insertData, updateData, deleteData) {
  return async function (req, res) {
    const { tempDoc, mainCollection, tempCollection } = req;

    try {
      let result;

      const controllers = [insertData, updateData, deleteData].filter(Boolean);

      if (controllers.length === 1) {
        result = await controllers[0](tempDoc, mainCollection);
      } else {
        switch (tempDoc.action) {
          case "insert":
            if (!insertData) throw new Error("Insert controller not provided");
            result = await insertData(tempDoc, mainCollection);
            break;

          case "update":
            if (!updateData) throw new Error("Update controller not provided");
            result = await updateData(tempDoc, mainCollection);
            break;

          case "delete":
            if (!deleteData) throw new Error("Delete controller not provided");
            result = await deleteData(tempDoc, mainCollection);
            break;

          default:
            return res.status(400).json({ error: "Invalid action" });
        }
      }

      // ✅ 4. Mark temp document as approved after success
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
