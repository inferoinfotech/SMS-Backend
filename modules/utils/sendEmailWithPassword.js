const nodemailer = require('nodemailer');

// Function to configure the transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

// Function to send email to Security Guards
const sendEmailToSecurityGuard = async (email, password) => {
    try {
        const transporter = createTransporter();

        const message = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Your Security Guard Login Password',
            text: `Welcome to the security team! Your login password is: ${password}. Please change it after logging in.`
        };

        await transporter.sendMail(message);
        console.log(`Password email sent to Security Guard: ${email}`);
    } catch (error) {
        console.error("Failed to send email to Security Guard:", error);
        throw new Error("Failed to send email to Security Guard");
    }
};

// Function to send email to Users
const sendEmailToUser = async (email, password) => {
    try {
        const transporter = createTransporter();

        const message = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Your User Login Password',
            text: `Welcome! Your login password is: ${password}. Please change it after logging in.`
        };

        await transporter.sendMail(message);
        console.log(`Password email sent to User: ${email}`);
    } catch (error) {
        console.error("Failed to send email to User:", error);
        throw new Error("Failed to send email to User");
    }
};

module.exports = { sendEmailToSecurityGuard, sendEmailToUser };
