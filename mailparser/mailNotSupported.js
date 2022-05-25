const transporterInfo = require("../utils/transporterInfo");

const mailNotSupported = email => {
  let transporter = transporterInfo.loginMail();

  let info = transporterInfo.sendMailInfo(
    "new",
    "Incident: Mail Not Supported",
    `Your mailbox does not currently have support for creating/replying to incidents`,
    "gallskrikarn@gmail.com",
    email
  );
};

module.exports = mailNotSupported;
