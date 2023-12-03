import nodemailer from "nodemailer";

export const sendEmail = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    // Configure this with your email service provider details
    service: "gmail",
    auth: {
      user: "taxjugnoo@gmail.com",
      pass: "cdvihzubevmorhxf",
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      return console.log("Email sent:", info.response);
    }
  });
};
