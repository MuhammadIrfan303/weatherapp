import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
    // Create a transporter using Gmail with App Password
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Your email address
            pass: process.env.EMAIL_PASS,  // Your generated app password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,  // Your email address
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', to);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
