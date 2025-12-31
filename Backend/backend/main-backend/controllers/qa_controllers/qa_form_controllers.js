const YEARS = ["I", "II", "III", "IV"]

const DEPARTMENTS = ["CSE", "ECE", "EEE", "AI&DS", "CIVIL", "AUTO", "E&I", "MECH", "CSE(CS)", "IT" ]
const SUBJECTS = [
  { code: "QA204", name: "QA/VR" },
  { code: "QA301", name: "QA/BS" },
  { code: "QA210", name: "QA" },
]


const {getDb} = require('../../config/db');

async function qa_form(req,res) {

    try {
        
        const db = getDb();
        
        const collection = db.collection('qa_question');
    
        const result = await collection.aggregate([
      {
        $project: {
          _id: 0,
          subject_name: 1,
          subject_cod:1,
          topics: "$exam.topic"
        }
      }
    ]).toArray();
    
   res.status(200).json({
  subjects: result,
  years: YEARS,
  departments: DEPARTMENTS,
  subjectList: SUBJECTS
});


    } catch (error) {

         res.status(500).json({message: "Server Error",error: error.message});
        
    }


    
};

module.exports = {qa_form}