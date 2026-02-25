const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail({ to, otp }) {
  return transporter.sendMail({
    from: `"Velammal Engineering College - Admin Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔐 VEC Admin Portal - Password Reset OTP",
    text: `Your OTP for Velammal Engineering College Admin Portal password reset is: ${otp}. This OTP is valid for 10 minutes. Do not share this code with anyone.`,

    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VEC Admin Portal Password Reset</title>
</head>

<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#f1f5f9;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f1f5f9;">
<tr>
<td align="center" style="padding:40px 20px;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="width:100%; max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden;">

<!-- Header -->
<tr>
<td style="background-color:#fdcc03; padding:40px 30px; text-align:center;">

<table role="presentation" align="center">
<tr>
<td style="width:80px; height:80px; background:#ffffff; border-radius:50%; text-align:center; font-size:40px;">
🔐
</td>
</tr>
</table>

<h1 style="margin:16px 0 0; color:#800000; font-size:26px;">
Admin Password Reset
</h1>

<p style="margin:8px 0 0; color:#1e293b; font-size:14px;">
Velammal Engineering College - Admin Portal
</p>

</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px 30px;">

<p style="font-size:16px; color:#1e293b;">
Hello Admin,
</p>

<p style="font-size:15px; color:#475569; line-height:1.6;">
We received a request to reset your password for the Velammal Engineering College Admin Portal.
Use the OTP below to complete your password reset.
</p>

<!-- OTP Box -->
<table width="100%" style="margin:30px 0;">
<tr>
<td align="center">

<table style="background:#fffbeb; border:3px solid #fdcc03; border-radius:12px;">
<tr>
<td style="padding:25px 40px; text-align:center;">

<p style="margin:0; font-size:13px; color:#64748b;">
YOUR OTP CODE
</p>

<p style="
font-size:42px;
font-weight:bold;
letter-spacing:10px;
color:#800000;
margin:10px 0;">
${otp}
</p>

<p style="font-size:12px; color:#64748b;">
Valid for 10 minutes
</p>

</td>
</tr>
</table>

</td>
</tr>
</table>

<!-- Warning -->
<table width="100%" style="background:#fef3c7; border-left:4px solid #fdcc03; border-radius:6px;">
<tr>
<td style="padding:15px;">
<p style="margin:0; font-size:14px; color:#92400e;">
⏰ This OTP will expire in 10 minutes.
</p>
</td>
</tr>
</table>

<br>

<!-- Security -->
<table width="100%" style="background:#fee2e2; border-left:4px solid #ef4444; border-radius:6px;">
<tr>
<td style="padding:15px;">
<p style="margin:0; font-size:14px; color:#7f1d1d;">
🔒 Do NOT share this OTP with anyone. If you did not request this reset, please contact the system administrator immediately.
</p>
</td>
</tr>
</table>

<br>

<p style="font-size:14px; color:#475569;">
If you need assistance, please contact the WebOps Team.
</p>

<!-- Signature -->
<p style="margin-top:30px; font-size:15px; color:#1e293b;">
Best regards,<br>
<strong style="color:#800000;">
WebOps Team
</strong><br>
Velammal Engineering College
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#1e293b; padding:20px; text-align:center;">

<p style="font-size:12px; color:#94a3b8;">
This is an automated email. Please do not reply.
</p>

<p style="font-size:11px; color:#64748b;">
© ${new Date().getFullYear()} Velammal Engineering College. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
  });
}

module.exports = { sendOtpEmail };