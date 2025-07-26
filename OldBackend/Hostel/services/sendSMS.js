const twilio = require('twilio');
const { twilio: twilioConfig } = require('../config/env');

const twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);

const sendParentApprovalSMS = async (parentPhoneNumber, name, place_to_visit, reason_for_visit, from, to, pass_id) => {
    const approvalUrl = `http://localhost:5000/api/parent_accept/${pass_id}`;
    const rejectionUrl = `http://localhost:5000/api/parent_not_accept/${pass_id}`;    
    const smsMessage = `
    📢 Pass Request Notification

    ${name}, a student of Velammal Engineering College,  
    has requested a pass to visit **${place_to_visit}**  
    for the reason: **${reason_for_visit}**.  

    📅 Duration: ${from} ➝ ${to}  

    Please review and take action:  
    ✅ Approve: ${approvalUrl}  
    ❌ Reject: ${rejectionUrl}  
    `;

    try {
        await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: parentPhoneNumber
        });
        console.log("✅ SMS sent successfully to parent");
    } catch (error) {
        console.error("❌ Error sending SMS:", error);
        throw new Error("Failed to send SMS");
    }
};

const sendParentReachedSMS = async (parentPhoneNumber, name, reachedTime) => {  
    const smsMessage = `
    📢 Arrival Notification  

    Dear Parent,  

    Your ward **${name}** has safely returned to the hostel.  

    🏡 **Hostel Arrival Time:** ${reachedTime}  

    Thank you,  
    Velammal Engineering College  
    `;
    try {
        await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: parentPhoneNumber
        });
        console.log(`✅ SMS sent successfully to parent of ${name}`);
    } catch (error) {
        console.error("❌ Error sending SMS:", error);
        throw new Error("Failed to send SMS");
    }
};

const sendOTPForForgetPassword = async (warden_number, name, req) => {  
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    req.session.otp = JSON.stringify(otp);
    req.session.otpExpires = Date.now() + 5 * 60 * 1000;
    const smsMessage = `
    🔐 Password Reset OTP  

    Dear ${name},  

    Your One-Time Password (OTP) for resetting your password is: **${otp}**  

    ⏳ This OTP is valid for 5 minutes. Do not share it with anyone.  

    Thank you,  
    Velammal Engineering College  
    `;

    try {
        await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: warden_number
        });
        console.log(`OTP sent successfully to ${name}`);
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
};

module.exports = {
    sendOTPForForgetPassword,
    sendParentApprovalSMS,
    sendParentReachedSMS
}