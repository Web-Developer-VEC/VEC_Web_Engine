async function insertData(tempDoc, mainCollection) {
  try {
    const { collection_type, category, meta_data } = tempDoc;

    const existingDoc = await mainCollection.findOne({
      type: collection_type
    });

    if (!existingDoc) {
      await mainCollection.insertOne({
        type: collection_type,
        data: [
          {
            category,
            content: meta_data.content
          }
        ]
      });

      return {
        success: true,
        message: "Type created"
      };
    }

    const categoryIndex = existingDoc.data.findIndex(
      item => item.category === category
    );

    if (categoryIndex === -1) {
      existingDoc.data.push({
        category,
        content: meta_data.content
      });
    } else {
      existingDoc.data[categoryIndex].content.push(...meta_data.content);
    }
    let tem = await mainCollection.findOne({ type: collection_type })
    console.log("😂😂", collection_type, tem);

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