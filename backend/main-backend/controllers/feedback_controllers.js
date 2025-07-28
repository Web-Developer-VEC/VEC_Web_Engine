const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function submitFeedback(req, res) {
  const { err_sub, err_page, err_desrp } = req.body;

  // Basic validation
  if (!err_sub || typeof err_sub !== 'string' || err_sub.trim() === '') {
    return res.status(400).json({ message: 'Feedback subject is required' });
  }
  if (!err_page || typeof err_page !== 'string' || err_page.trim() === '') {
    return res.status(400).json({ message: 'Page is required' });
  }
  if (!err_desrp || typeof err_desrp !== 'string' || err_desrp.trim() === '') {
    return res.status(400).json({ message: 'Description is required' });
  }

  const db = getDb();
  const collection = db.collection('web_team_feedback');

  // Get current date & time in IST
  const istDateTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const feedbackDoc = {
    subject: err_sub,
    page: err_page,
    description: err_desrp,
    submittedAt: istDateTime
  };

  try {
    await collection.insertOne(feedbackDoc);
    return res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    await logError(req, error, 'Error submitting feedback', 500);
    return res.status(500).json({ error: 'Internal server error while submitting feedback' });
  }
}

module.exports = { submitFeedback };
