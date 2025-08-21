const { getDb } = require('../config/db');
const nodemailer = require('nodemailer');
const logError = require('../middlewares/logerror');

async function submitFeedback(req, res) {
  const { err_sub, err_page, err_descrp } = req.body;

  // Basic validation
  if (!err_sub || typeof err_sub !== 'string' || err_sub.trim() === '') {
    return res.status(400).json({ message: 'Feedback subject is required' });
  }
  if (!err_page || typeof err_page !== 'string' || err_page.trim() === '') {
    return res.status(400).json({ message: 'Page is required' });
  }
  if (!err_descrp || typeof err_descrp !== 'string' || err_descrp.trim() === '') {
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
    description: err_descrp,
    submittedAt: istDateTime
  };

  try {
    await collection.insertOne(feedbackDoc);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.BASE_EMAIL, 
        pass: process.env.BASE_EMAIL_PASSWORD 
      }
    });

    const mailOptions = {
      from: `"VEC Feedback Bot" <${process.env.BASE_EMAIL}>`, 
      to: process.env.FEEDBACK_TARGET_EMAIL, 
      subject: `New Feedback: ${err_sub}`,
      html: `
        <div style="max-width:600px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e0e0e0;font-family:'Segoe UI',Arial,sans-serif;color:#222;">
          <h2 style="font-weight:700;margin-bottom:16px;border-bottom:1px solid #e0e0e0;padding-bottom:8px;">New Feedback Submitted</h2>
          <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Subject:</span> ${err_sub}</p>
          <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Page:</span> ${err_page}</p>
          <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Description:</span> ${err_descrp}</p>
          <p style="font-size:16px;margin:12px 0;"><span style="font-weight:600;">Submitted At (IST):</span> ${istDateTime}</p>
        </div>
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
