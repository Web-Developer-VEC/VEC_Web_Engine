const { getDb } = require('../../config/db');

async function getStudentProfile (req, res) {
    try {
      const db =getDb();
      const profilesCollection = db.collection("student_database");
      const unique_id = req.session.unique_number;
      const profile = await profilesCollection.findOne({ registration_number: unique_id });
  
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

async function changeFoodType (req, res) {

    const registration_number = req.session.unique_number;
    const db = getDb();
    const studentsCollection = db.collection('student_database');
    const requestsCollection = db.collection('food_change_requests');
    const wardensCollection = db.collection('warden_database');

    try {
        const student = await studentsCollection.findOne({ registration_number });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const newFoodType = student.foodtype === 'Veg' ? 'Non-Veg' : 'Veg';

        let warden = await wardensCollection.findOne({ 
            primary_year: { $in: [student.year] }, 
            gender: student.gender,
            active: true 
        });
        
        if (!warden) {
            warden = await wardensCollection.findOne({ 
                secondary_year: { $in: [student.year] }, 
                gender: student.gender,
                active: true 
            });
        }        
        if (!warden) {
            return res.status(403).json({ message: 'No active warden found for this student year' });
        }

        await requestsCollection.insertOne({ 
            registration_number, 
            name : student.name,
            previous_foodtype: student.foodtype,
            requested_foodtype: newFoodType, 
            room_number: student.room_number,
            department: student.department,
            gender: student.gender,
            status: null,
            year: student.year, 
            assigned_warden: warden.warden_name
        });
        await studentsCollection.updateOne(
            { registration_number },
            { 
                $set: { edit_status: null },
                $push: {
                    changes: `food_type: ${newFoodType}`
                }
            }
        );        

        res.status(200).json({ message: 'Request submitted for approval', requested_foodtype: newFoodType });
    } catch (error) {
        console.error('❌ Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function profileChangeRequest(req, res) {
    try {
        const { phone_number_student, phone_number_parent , name } = req.body;

        const db = getDb();
        const studentCollection = db.collection('student_database');
        const tempRequestCollection = db.collection('profile_change_requests');
        const registration_number = req.session.unique_number;
        const profile = await studentCollection.findOne({ registration_number });
        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }
        const fromData = {
            name: profile.name,
            phone_number_student: profile.phone_number_student,
            phone_number_parent: profile.phone_number_parent
        };
        const toData = {
            name: name || profile.name,
            phone_number_student: phone_number_student || profile.phone_number_student,
            phone_number_parent: phone_number_parent || profile.phone_number_parent
        };
        const changes = [];
        for (const key in fromData) {
            if (fromData[key] !== toData[key]) {
                changes.push(`${key}: ${toData[key]}`);
            }
        }
        const updateRequest = {
            registration_number,
            name: toData.name,
            room_number: profile.room_number,
            year:profile.year,
            department: profile.department,
            phone_number_student: toData.phone_number_student,
            phone_number_parent: toData.phone_number_parent,
            from_data: fromData,
            to_data: toData,
            edit_status: null,
            created_at: new Date(),
            gender: profile.gender
        };
        await tempRequestCollection.insertOne(updateRequest);
        await studentCollection.updateOne(
            { registration_number },
            { 
                $set: { edit_status: null },
                $push: { changes: { $each: changes } }
            }
        );

        res.json({
            message: "Profile update requested. Waiting for approval from wardens.",
            request: updateRequest
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

  module.exports = {
    getStudentProfile,
    changeFoodType,
    profileChangeRequest
  }