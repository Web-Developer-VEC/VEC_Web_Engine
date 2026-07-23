async function insertData(tempDoc, mainCollection) {

  try {

    const { collection_type, category, meta_data } = tempDoc;

    const existingDoc = await mainCollection.findOne({
      type: collection_type
    });

    if (!existingDoc) {

      await mainCollection.insertOne({
        type: collection_type,
        data: [{
          category,
          name: meta_data.name,
          description: meta_data.description,
          image_path: meta_data.image_path
        }]
      });

      return {
        success: true,
        message: "Type created"
      };
    }

    const categoryIndex = existingDoc.data.findIndex(
      c => c.category === category
    );

    if (categoryIndex === -1) {

      existingDoc.data.push({
        category,
        name: meta_data.name,
        description: meta_data.description,
        image_path: meta_data.image_path
      });

    } else {

      const cat = existingDoc.data[categoryIndex];

      cat.name.push(...meta_data.name);
      cat.description.push(...meta_data.description);
      cat.image_path.push(...meta_data.image_path);

    }

    await mainCollection.updateOne(
      { type: collection_type },
      {
        $set: {
          data: existingDoc.data
        }
      }
    );

    return {
      success: true,
      message: "Inserted successfully"
    };

  } catch (err) {

    return {
      success: false,
      error: err.message
    };

  }

}

module.exports = { insertData };