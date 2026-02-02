async function insertData(tempDoc, mainCollection) {
    try{

        const { collection_type, category, meta_data } = tempDoc;

        if(!collection_type || !meta_data){
            throw new Error("Missing required fields: collection_type or meta_data");
        }

        const doc = await mainCollection.findOne({ type:collection_type});

        const multipleObjectTypes = ["exam_curriculum"];

        const categoryBasedTypes = ["COE","regulation","all_forms"]


        if(multipleObjectTypes.includes(collection_type)){

            if(!doc){
                throw new Error("Document with the specified collection_type not found");
            }
            await mainCollection.updateOne(
                { type: collection_type },
                { $push: { data: meta_data } }
            );

            return { message: "Data inserted successfully into existing document" };

        }else if(categoryBasedTypes.includes(collection_type)){

            if(!category){
                throw new Error("Missing required field: category");
            }
            if(!doc){
                throw new Error("Document with the specified collection_type not found");
            }

            const categoryExists = doc.data.find(item => item.category === category);

            if(categoryExists){

                const updatefields = collection_type ===  "COE"? "data.$.members":collection_type === "regulation"? "data.$.links":"data.$.content";

                await mainCollection.updateOne(
                    { type: collection_type, "data.category": category },
                    { $push: { [updatefields]: meta_data } }
                );

                return { message: "Data inserted successfully into existing category" };
            }else{
                let newCategoryObject;

if (collection_type === "COE") {
  newCategoryObject = {
    category,
    members: meta_data.members || []
  };
} else if (collection_type === "regulation") {
  newCategoryObject = {
    category,
    links: meta_data.links || []
  };
} else {
  newCategoryObject = {
    category,
    content: meta_data.content || []
  };
}

await mainCollection.updateOne(
  { type: collection_type },
  {
    $push: {
      data: newCategoryObject
    }
  }
);

            }
        }

    }catch(error){
    throw new Error(`Internal Server Error: ${error.message}`);
    }
};


module.exports = { insertData };