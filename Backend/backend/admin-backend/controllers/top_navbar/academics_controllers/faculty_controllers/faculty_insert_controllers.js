async function insertData(tempDoc, mainCollection) {
    try{

    const {collection_type, meta_data, category} = tempDoc;

    if(!collection_type || !meta_data || !category){

        throw new Error("meta data and collection type and category is required");
    }

    if(category === "head_of_department" || category === "teaching_staff" || category === "non_teaching_staff"){

        await mainCollection.updateOne(
            {type:collection_type,"data.category":category},
            {$push:{"data.$.members":meta_data}},
        );

        return{message:`The new faculty is inserted in ${category} successfully`};

    }else if(category === "faculty_pdf_path"){

        const new_data = Array.isArray(meta_data)
    ? meta_data.map(item => (typeof item === "string" ? item : Object.values(item)[0]))
    : [typeof meta_data === "string" ? meta_data : Object.values(meta_data)[0]];

        await mainCollection.updateOne(
            {type:collection_type,"data.category":category},
            {$push:{"data.$.content":{$each:new_data}}}
        );

        return{message:`The faculty pdf is inserted in ${category} successfully`};
    }else{

        await mainCollection.updateOne(
            {type:collection_type},
            {$push:{data:{category:category,content:meta_data}}}
        );

        return{message:`The new category is inserted  successfully`};
    }
}catch(error){
    console.error("error in inserting",error);
    throw error;
    
}
    
}


module.exports = {insertData}