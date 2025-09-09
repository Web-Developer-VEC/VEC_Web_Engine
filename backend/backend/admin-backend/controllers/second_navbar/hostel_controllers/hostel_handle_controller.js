async function handleTempAction(req, res) {
  const { tempDoc, mainCollection, tempCollection } = req;

  try {
    let result;

    switch (tempDoc.action) {
      case "insert":
        result = await insertData(tempDoc, mainCollection);
        break;
      case "update":
        result = await updateData(tempDoc, mainCollection);
        break;
      case "delete":
        result = await deleteData(tempDoc, mainCollection);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // ✅ Only set approved if the controller succeeded
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

    // ❌ Do not change status (remains pending)
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { handleTempAction };
