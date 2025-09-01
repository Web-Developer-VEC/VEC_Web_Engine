
// ------------------- INSERT -------------------
async function insertData(req, res, tempDoc,mainCollection) {
  try {
    
    const { type, newData, category } = tempDoc;
    if (!type || !newData) return res.status(400).json({ error: "Type and newData required" });

    let doc = await mainCollection.findOne({ type });
    const files = req.files || [];
    const filePaths = files.map(f => "/uploads/" + f.filename);

    // TEAM photos
    if (type === "team" && category && filePaths.length > 0) {
      newData.photos = (newData.photos || []).concat(filePaths);
    }

    // AWARDS / EVENTS / TEAM files
    if (["awards", "events", "team"].includes(type) && filePaths.length > 0) {
      newData.files = (newData.files || []).concat(filePaths);
    }

    // ABOUT type
    if (type === "about") {
      let updatedData = Array.isArray(doc?.data) ? [...doc.data] : [doc?.data || {}];

      updatedData = updatedData.map(item => {
        let newItem = { ...item };
        Object.keys(newData).forEach(key => {
          if (Array.isArray(newItem[key])) {
            newItem[key] = [...new Set([...newItem[key], ...(Array.isArray(newData[key]) ? newData[key] : [newData[key]])])];
          } else {
            newItem[key] = Array.isArray(newData[key]) ? newData[key] : [newData[key]];
          }
        });
        return newItem;
      });

      await mainCollection.updateOne({ type: "about" }, { $set: { data: updatedData } }, { upsert: true });

      return res.json({ message: "About data updated successfully", data: updatedData });
    }

    // NEWS UPDATES
    if (type === "news_updates") {
      const updatedData = doc ? [...doc.data, newData] : [newData];
      await mainCollection.updateOne({ type }, { $set: { data: updatedData } }, { upsert: true });
      return res.json({ message: "News update inserted successfully", data: updatedData });
    }

    // AWARDS / EVENTS
    if (["awards", "events"].includes(type)) {
      if (!doc) {
        await mainCollection.insertOne({ type, data: [newData] });
      } else {
        await mainCollection.updateOne({ type }, { $push: { data: newData } });
      }
      return res.json({ message: `Insert successful for ${type}` });
    }

    // TEAM
    if (type === "team") {
      if (!category) return res.status(400).json({ error: "Category required for team" });

      if (doc) {
        const categoryExists = doc.data.find(c => c.category === category);
        if (categoryExists) {
          await mainCollection.updateOne({ type, "data.category": category }, { $push: { "data.$.members": newData } });
        } else {
          await mainCollection.updateOne({ type }, { $push: { data: { category, members: [newData] } } });
        }
      } else {
        await mainCollection.insertOne({ type, data: [{ category, members: [newData] }] });
      }

      return res.json({ message: "Insert successful for Team" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

// ------------------- UPDATE -------------------
async function updateData(req, res, tempDoc,mainCollection) {
  try {
    
    const { type, newData, existingData, category } = tempDoc;
    if (!type || !newData) return res.status(400).json({ error: "Type and newData required" });

    const doc = await mainCollection.findOne({ type });
    if (!doc) return res.status(404).json({ error: "Type not found" });

    const files = req.files || [];
    const filePaths = files.map(f => "/uploads/" + f.filename);

    if (type === "team" && category && filePaths.length > 0) {
      newData.photos = (newData.photos || []).concat(filePaths);
    }
    if (["awards", "events", "team"].includes(type) && filePaths.length > 0) {
      newData.files = (newData.files || []).concat(filePaths);
    }

    // ABOUT
    if (type === "about") {
      let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data];
      updatedData = updatedData.map(item => {
        let newItem = { ...item };
        Object.keys(newData).forEach(key => {
          if (Array.isArray(newItem[key])) {
            newItem[key] = newItem[key].map(val => val === existingData[key] ? newData[key] : val);
            if (!newItem[key].includes(newData[key])) newItem[key].push(newData[key]);
          } else {
            if (newItem[key] === existingData[key]) newItem[key] = newData[key];
          }
        });
        return newItem;
      });
      await mainCollection.updateOne({ type: "about" }, { $set: { data: updatedData } });
      return res.json({ message: "About data updated successfully", data: updatedData });
    }

    // NEWS UPDATES
    if (type === "news_updates") {
      const updatedData = doc.data.map(item => item === existingData ? newData : item);
      await mainCollection.updateOne({ type }, { $set: { data: updatedData } });
      return res.json({ message: "News update modified successfully", data: updatedData });
    }

    // AWARDS / EVENTS
    if (["awards", "events"].includes(type)) {
      const index = doc.data.findIndex(item =>
        Object.keys(existingData).every(k => item[k] === existingData[k])
      );
      if (index === -1) return res.status(404).json({ error: "Matching object not found" });
      doc.data[index] = { ...doc.data[index], ...newData };
      await mainCollection.updateOne({ type }, { $set: { data: doc.data } });
      return res.json({ message: `Update successful for ${type}` });
    }

    // TEAM
    if (type === "team") {
      if (!category) return res.status(400).json({ error: "Category required for team" });
      const catIndex = doc.data.findIndex(c => c.category === category);
      if (catIndex === -1) return res.status(404).json({ error: "Category not found" });
      const memberIndex = doc.data[catIndex].members.findIndex(m =>
        Object.keys(existingData).every(k => m[k] === existingData[k])
      );
      if (memberIndex === -1) return res.status(404).json({ error: "Member not found" });
      doc.data[catIndex].members[memberIndex] = { ...doc.data[catIndex].members[memberIndex], ...newData };
      await mainCollection.updateOne({ type }, { $set: { data: doc.data } });
      return res.json({ message: "Update successful for Team" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

// ------------------- DELETE -------------------
async function deleteData(req, res, tempDoc,mainCollection) {
  try {
    
    const { type, existingData, category } = tempDoc;
    if (!type) return res.status(400).json({ error: "Type required" });

    const doc = await mainCollection.findOne({ type });
    if (!doc) return res.status(404).json({ error: "Type not found" });

    // ABOUT
    if (type === "about") {
      let updatedData = Array.isArray(doc.data) ? [...doc.data] : [doc.data];
      updatedData = updatedData.map(item => {
        let newItem = { ...item };
        if (existingData) {
          Object.keys(existingData).forEach(key => {
            if (Array.isArray(newItem[key])) {
              newItem[key] = newItem[key].filter(val => val !== existingData[key]);
              if (newItem[key].length === 0) delete newItem[key];
            } else {
              if (newItem[key] === existingData[key]) delete newItem[key];
            }
          });
        }
        return newItem;
      });
      await mainCollection.updateOne({ type: "about" }, { $set: { data: updatedData } });
      const freshDoc = await mainCollection.findOne({ type: "about" });
      return res.json({ message: "About data deleted successfully", data: freshDoc.data });
    }

    // NEWS UPDATES
    if (type === "news_updates") {
      const updatedData = doc.data.filter(item => item !== existingData);
      await mainCollection.updateOne({ type }, { $set: { data: updatedData } });
      return res.json({ message: "News update deleted successfully", data: updatedData });
    }

    // AWARDS / EVENTS
    if (["awards", "events"].includes(type)) {
      doc.data = doc.data.filter(item =>
        !Object.keys(existingData).every(k => item[k] === existingData[k])
      );
      await mainCollection.updateOne({ type }, { $set: { data: doc.data } });
      return res.json({ message: `Delete successful for ${type}` });
    }

    // TEAM
    if (type === "team") {
      if (!category) return res.status(400).json({ error: "Category required for team" });
      const catIndex = doc.data.findIndex(c => c.category === category);
      if (catIndex === -1) return res.status(404).json({ error: "Category not found" });
      doc.data[catIndex].members = doc.data[catIndex].members.filter(m =>
        !Object.keys(existingData).every(k => m[k] === existingData[k])
      );
      await mainCollection.updateOne({ type }, { $set: { data: doc.data } });
      return res.json({ message: "Delete successful for Team" });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}

// ------------------- ROUTE HANDLER -------------------
async function handleTempAction(req, res) {
  try {
    const tempDoc = req.tempDoc;              // ✅ from handleTempApproval
    const mainCollection = req.mainCollection; 
    console.log(tempDoc.status)

    if (tempDoc.status !== "approved") {
      return res.status(400).json({ error: "Action not approved yet" });
    }

    switch (tempDoc.action) {
      case "insert":
        await insertData(req, res, tempDoc, mainCollection);
        break;
      case "update":
        await updateData(req, res, tempDoc, mainCollection);
        break;
      case "delete":
        await deleteData(req, res, tempDoc, mainCollection);
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // ✅ send success response once
    return res.json({ message: `Action '${tempDoc.action}' executed successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

module.exports = { handleTempAction };
