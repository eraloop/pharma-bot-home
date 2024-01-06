async function sendOrderEmail(drugs) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "903b6673456697",
          pass: "fe41a227ec230a",
        },
      });
  
      const mailOptions = {
        from: "sospharma@pharma.co",
        to: "recipient@example.com",
        subject: "Medication Order",
        text: `This is a test email sent from Node.js using Nodemailer with Mailtrap. \n\nList of drugs:\n${drugs.join('\n')}`,
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
  