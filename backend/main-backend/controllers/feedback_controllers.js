const { getDb } = require('../config/db');
const nodemailer = require('nodemailer');
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

  // IST time
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

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.BASE_EMAIL, // ✅ Sender email
        pass: process.env.PASSWORD // ✅ App password for sender
      }
    });

    const mailOptions = {
      from: `"VEC Feedback Bot" <${process.env.BASE_EMAIL}>`, // ✅ Sender name and email
      to: process.env.TARGET_EMAIL, // ✅ Receiver email
      subject: `🛠 New Feedback: ${err_sub}`,
      html: `
        <h3>📝 New Feedback Submitted</h3>
        <p><strong>Subject:</strong> ${err_sub}</p>
        <p><strong>Page:</strong> ${err_page}</p>
        <p><strong>Description:</strong> ${err_desrp}</p>
        <p><strong>Submitted At (IST):</strong> ${istDateTime}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({ message: 'Feedback submitted and email sent successfully' });

  } catch (error) {
    console.error('Error saving or emailing feedback:', error);
    await logError(req, error, 'Feedback submission failed', 500);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { submitFeedback };
