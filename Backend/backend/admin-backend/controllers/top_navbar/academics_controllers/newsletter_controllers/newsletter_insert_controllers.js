async function insertData(tempDoc, mainCollection) {

    try {
        const { collection_type, meta_data, category } = tempDoc;

        if (!collection_type || !meta_data || !category) {

            throw new Error("collection_type, meta_data and category is required");

        };
        if (collection_type !== "newsletter") {
            throw new Error("Incorrect collection type or route");
        }

        const doc = await mainCollection.findOne({ type: collection_type });

        if (doc) {

            if (collection_type === "newsletter") {

                if (category === "newsletter") {

                    const yearExists = await mainCollection.findOne({
                        type: collection_type,
                        data: {
                            $elemMatch: {
                                category: category,
                                "content.year": meta_data.year
                            }
                        }
                    });

                    if (yearExists) {

                        await mainCollection.updateOne(
                            {
                                type: collection_type,
                                data: {
                                    $elemMatch: {
                                        category: category,
                                        "content.year": meta_data.year
                                    }
                                }
                            },
                            {
                                $addToSet: {
                                    "data.$.content.$[content].pdf_path": {
                                        $each: meta_data.pdf_path
                                    }
                                }
                            },
                            {
                                arrayFilters: [
                                    { "content.year": meta_data.year }
                                ]
                            }
                        );

                    } else {

                        await mainCollection.updateOne(
                            {
                                type: collection_type,
                                "data.category": category
                            },
                            {
                                $push: {
                                    "data.$.content": meta_data
                                }
                            }
                        );

                    }


                    return { success: true, message: `thet data is inserted successfully in the ${collection_type}` }
                } else {

                    await mainCollection.updateOne(
                        { type: collection_type },
                        { $push: { data: { category: category, meta_data } } }
                    );

                }
            }
        }
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }

}

module.exports = { insertData };
