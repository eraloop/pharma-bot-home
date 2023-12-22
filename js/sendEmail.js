import { createTransport } from 'nodemailer';

function sendEmail(){
    // const recipient = 'romanricakam@gmail.com';
    // const subject = 'Order fro sos pharma';
    // const body = 'This is the body of the email.';
    // const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // window.location.href = mailtoLink;

// Create a transporter object using SMTP
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "903b6673456697",
    pass: "fe41a227ec230a"
  }
});

// Define the email content
const mailOptions = {
  from: 'your_email@example.com', // Sender's email address
  to: 'recipient@example.com', // Recipient's email address
  subject: 'Hello, World!', // Email subject
  text: 'This is a test email sent from Node.js.', // Email body (plain text)
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});

}
