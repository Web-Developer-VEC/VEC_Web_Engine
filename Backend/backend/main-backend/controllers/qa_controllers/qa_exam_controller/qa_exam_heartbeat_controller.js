const { getDb } = require("../../../config/db");

async function heartbeat(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session || session.status !== "ACTIVE") {
    return res.status(403).json({
      status: session?.status || "TERMINATED",
      reason: session?.terminatedReason
    });
  }

  // 🔒 MULTIPLE TAB DETECTION (HERE)
//   if (
//     session.lastSeenAt &&
//     Date.now() - new Date(session.lastSeenAt).getTime() < 1000
//   ) {
//     await sessionCol.updateOne(
//       { _id: session._id },
//       {
//         $set: {
//           status: "TERMINATED",
//           terminatedReason: "MULTIPLE_TAB_DETECTED",
//           endedAt: new Date()
//         }
//       }
//     );

//     return res.status(403).json({
//       status: "MULTIPLE_TAB_DETECTED"
//     });
//   }

  // 🔥 LONG DISCONNECT CHECK
  if (
    session.status === "PAUSED" &&
    session.offline?.lastDisconnectedAt &&
    Date.now() - new Date(session.offline.lastDisconnectedAt).getTime() > 5 * 60 * 1000
  ) {
    await sessionCol.updateOne(
        { _id: session._id },
        {
        $set: {
            status: "TERMINATED",
            terminatedReason: "LONG_DISCONNECT",
            endedAt: new Date()
        }
        }
    );

    return res.status(403).json({
        status: "TERMINATED",
        reason: "Disconnected too long"
    });
  }

  await sessionCol.updateOne(
    { _id: session._id },
    { $set: { lastSeenAt: new Date() } }
  );

  res.json({ success: true });
}

module.exports = { heartbeat }