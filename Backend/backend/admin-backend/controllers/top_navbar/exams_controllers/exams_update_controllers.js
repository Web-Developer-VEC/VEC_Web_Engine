async function updatedData(tempDoc, mainCollection) { 

    try{

        const { collection_type, category, original_data, meta_data } = tempDoc;

        if(!collection_type || !original_data || !meta_data){
            throw new Error("Missing required fields: collection_type, original_data or meta_data");
        }

        const doc = await mainCollection.findOne({ type: collection_type });

        if(!doc){
            throw new Error("Document with the specified collection_type not found");
        }
        
        const multipleObjectTypes = ["exam_curriculum"];

        const categoryBasedTypes = ["COE","regulation","all_forms"]


        if(multipleObjectTypes.includes(collection_type)){
            const dataExists = doc.data.find(item => JSON.stringify(item) === JSON.stringify(original_data));

            if(!dataExists){
                throw new Error("Original data not found");
            }   

            await mainCollection.updateOne(
                { type: collection_type, "data": original_data },
                { $set: { "data.$": meta_data } }
            );

            return { message: "Data updated successfully" };

        }else if(categoryBasedTypes.includes(collection_type)){

            if(!category){
                throw new Error("Missing required field: category");
            }
            if(!doc){
                throw new Error("Document with the specified collection_type not found");
            }


        const categoryExists = doc.data.find(item => item.category === category);

        if(!categoryExists){
            throw new Error("Category not found");
        }

        const updatefields = collection_type ===  "COE"? "data.$[elem].members":collection_type === "regulation"? "data.$[elem].links":"data.$[elem].content";
        const content = collection_type ===  "COE"? categoryExists.members:collection_type === "regulation"? categoryExists.links:categoryExists.content;

        const isEqual = (obj1, obj2) =>
          Object.keys(obj1).every((key) => obj2[key] === obj1[key]);

        const updatedArray = (Array.isArray(content) ? content : []
        ).map((item) =>
          isEqual(item, original_data) ? { ...item, ...meta_data } : item
        );

        await mainCollection.updateOne(
            { type: collection_type },
            { $set: { [updatefields]: updatedArray }},
            { arrayFilters: [{ "elem.category": category }]}
        );
        return { message: "Data updated successfully" };
    }else{
        await mainCollection.updateOne(
            { type: collection_type },
            { $push: { data: { category, ...meta_data } } }
        );
        return { message: `Updated data in ${collection_type}` };
    }

    }catch(error){
        throw new Error(`Internal Server Error: ${error.message}`);
    }
};

module.exports = { updatedData };