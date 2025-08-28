const { getDb } = require("../config/db");
const path = require('path');
const fs = require('fs');

async function insertData(req, res) {
  try {
    const db = getDb();
    const { type } = req.body;

    const categories = Array.isArray(req.body.categories)
      ? req.body.categories
      : [req.body.categories];

    // Parse links
    let links = req.body.links;
    if (typeof links === "string") {
      try {
        links = JSON.parse(links);
      } catch {
        links = links.split(',');
      }
    }
    if (!Array.isArray(links)) links = [links];

    if (!type || !categories.length || !req.files?.length) {
      return res
        .status(400)
        .json({ error: "type, categories, and files are required" });
    }

    const collection = db.collection("gallery");
    let existingDoc = await collection.findOne({ type });

    // Group files by category
    const filesGroupedByCategory = {};
    req.files.forEach((file, index) => {
      const category = categories[index];
      if (!filesGroupedByCategory[category]) filesGroupedByCategory[category] = [];
      filesGroupedByCategory[category].push(file);
    });

    if (!existingDoc) {
      existingDoc = { type, data: [] };
    }

    for (const [category, files] of Object.entries(filesGroupedByCategory)) {
      const categoryIndex = existingDoc.data.findIndex((c) => c.category === category);
      let existingImages = [];

      if (categoryIndex !== -1) {
        existingImages = existingDoc.data[categoryIndex].image_path || [];
      }

      // Separate images vs links
      const existingImageFiles = existingImages.filter((item) => {
        // crude check: if it looks like a file path, not a link
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(item);
      });
      const existingLinks = existingImages.filter((item) => !existingImageFiles.includes(item));

      let counter = existingImageFiles.length;

      const renamedImages = files.map((file) => {
        const ext = path.extname(file.originalname);
        counter++;
        const newFileName = `${category}_${counter}${ext}`;
        const categoryDir = path.join(__dirname, `../../uploads/${category}`);
        fs.mkdirSync(categoryDir, { recursive: true });

        // Move from temp to correct folder
        const newPath = path.join(categoryDir, newFileName);
        fs.renameSync(file.path, newPath);

        return `/uploads/${category}/${newFileName}`;
      });

      if (categoryIndex === -1) {
        existingDoc.data.push({
          category,
          image_path: [...renamedImages, ...links],
        });
      } else {
        existingDoc.data[categoryIndex].image_path = Array.from(
          new Set([...existingImageFiles, ...renamedImages, ...existingLinks, ...links])
        );
      }
    }

    await collection.updateOne(
      { type },
      { $set: { data: existingDoc.data } },
      { upsert: true }
    );

    res.json({ message: "Images inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: error.message });
  }
}

async function deleteData(req, res) {
  try {
    const db = getDb();
    const { type, category, image_path } = req.body;
    
    if (!type || !category || !image_path) {
      return res.status(400).json({ error: "type, category, and image_path are required" });
    }

    const collection = db.collection("gallery");
    const existingDoc = await collection.findOne({ type });
    if (!existingDoc) return res.status(404).json({ error: "Type not found" });

    const categoryIndex = existingDoc.data.findIndex(c => c.category === category);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Category not found" });
    }

    const removeImages = Array.isArray(image_path) ? image_path : [image_path];
    existingDoc.data[categoryIndex].image_path =
      existingDoc.data[categoryIndex].image_path.filter(img => !removeImages.includes(img));
    
    for (const img of removeImages) {
      if (!img.includes("youtube.com") && !img.includes("youtu.be")) {
        const filePath = path.join(__dirname, `../../${img}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await collection.updateOne({ type }, { $set: { data: existingDoc.data } });

    res.json({ message: "Image(s) deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { insertData, deleteData };
