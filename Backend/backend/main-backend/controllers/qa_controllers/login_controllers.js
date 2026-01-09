const { hashPassword, comparePassword } = require("../../../admin-backend/middlewares/bcrypt");
const { generateToken } = require("../../../admin-backend/middlewares/jwt");
const { getDb } = require("../../config/db");


async function signup(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("staff");

    const{ name, role, email, password, phone_no }  = req.body;

    // check if exists
    const existingAdmin = await collection.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // save admin
    await collection.insertOne({
      name,
      role,
      email,
      password: hashedPassword,
      phone_no,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// 🔹 Login
async function stafflogin(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("staff");
    const { email, password } = req.body;

    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    req.session.user = {
      id: user._id,
      role: user.role,
      token
    };

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


async function studentlogin(req, res) {
  try {
    const db = getDb();
    const studentCol = db.collection("student");
    const sessionCol = db.collection("qa_exam_sessions");

    const { registerno, password, department, batch } = req.body;

    // 1️⃣ Validate required fields
    if (!registerno || !password || !department || !batch) {
      return res.status(400).json({
        message: "Register number, password, department, and batch are required"
      });
    }

    // 2️⃣ Find student
    const student = await studentCol.findOne({
      registerno,
      department,
      batch
    });

    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Verify password (plain text — consider hashing later)
    if (password !== student.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔥 4️⃣ BLOCK SECOND LOGIN IF EXAM SESSION EXISTS
    const activeSession = await sessionCol.findOne({
      registerno,
      status: { $in: ["ACTIVE", "PAUSED"] }
    });

    if (activeSession) {
      const lastSeenAt = new Date(activeSession.lastSeenAt);
      const timeSinceLastSeen = Date.now() - lastSeenAt.getTime();
      
      if (timeSinceLastSeen > 6000000) {
        // Zombie session - auto cleanup
        await sessionCol.updateOne(
          { _id: activeSession._id },
          {
            $set: {
              status: "TERMINATED",
              terminatedReason: "SESSION_ABANDONED",
              endedAt: new Date()
            }
          }
        );
      } else if (activeSession.status === "PAUSED") {
        // Session is paused - allow recovery
        return res.status(200).json({
          success: true,
          code: "SESSION_PAUSED",
          message: "Your previous exam session was paused. You can resume it.",
          canResume: true,
          sessionId: activeSession.sessionId,
          student: {
            name: student.name,
            registerno: student.registerno,
            department: student.department,
            batch: student.batch
          }
        });
      } else {
        // Genuinely active session
        return res.status(403).json({
          success: false,
          code: "ALREADY_LOGGED_IN",
          message: "You are already attending the exam. Multiple logins are not allowed."
        });
      }
    }

    const blockedSession = await sessionCol.findOne({
      registerno,
      status: { $in: ["TERMINATED", "COMPLETED"] }
    });

    if(blockedSession){

      if (blockedSession.status === "TERMINATED") {
         // Session is terminated - dont allow recovery
         return res.status(403).json({
           success: false,
           code: "SESSION_TERMINATED",
           message: "The exam was terminated due to a violation of the exam guidelines.",
           canResume: false,
           sessionId: blockedSession.sessionId,
           student: {
             name: student.name,
             registerno: student.registerno,
             department: student.department,
             batch: student.batch
           }
         });
       }
       else if (blockedSession.status === "COMPLETED") {
         // Session is completed - dont allow recovery
         return res.status(403).json({
           success: false,
           code: "SESSION_COMPLETED",
           message: "The exam has been completed. therefore, you cannot log in again.",
           canResume: false,
           sessionId: blockedSession.sessionId,
           student: {
             name: student.name,
             registerno: student.registerno,
             department: student.department,
             batch: student.batch
           }
         });
       }
    }


    // 5️⃣ Generate JWT token
    const token = generateToken({
      id: student._id,
      registerno: student.registerno
    });

    // 6️⃣ Store user in server session
    req.session.user = {
      id: student._id,
      registerno: student.registerno,
      department: student.department,
      batch: student.batch,
      token
    };

    // 7️⃣ Success response
    return res.json({
      message: "Student login successful",
      token,
      student: {
        name: student.name,
        registerno: student.registerno,
        department: student.department,
        batch: student.batch
      }
    });

  } catch (err) {
    console.error("Student login error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

module.exports = {signup , stafflogin , studentlogin}