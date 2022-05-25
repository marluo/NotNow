const nodemailer = require("nodemailer");

const loginMail = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "gallskrikarn@gmail.com", // generated ethereal user
      pass: "HEJsan123!" // generated ethereal password
    }
  });

const sendMailInfo = async (typeOf, subject, reply, from, to, transporter) =>
  await transporter.sendMail({
    from: from ? from : "gallskrikarn@gmail.com", // sender address
    to: to, // change to reply to email
    //prettier-ignore
    subject: subject,
    //prettier-ignore
    html:reply
  });

module.exports = {
  loginMail,
  sendMailInfo
};
