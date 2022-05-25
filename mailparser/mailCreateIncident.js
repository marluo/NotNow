const db = require("../db/db");
const transporterInfo = require("../utils/transporterInfo");

const mailCreateIncident = async (mail, subject, reply) => {
  const emailAndOwner = await db
    .select("email", "username", "orgid")
    .from("users")
    .where({ "users.email": mail });

  if (emailAndOwner[0].length > 0) {
    return transporterInfo.sendMailInfo(
      "new",
      "Please Register on the Incident Management Portal",
      `You need to Register in order to to do this. Please visit x`,
      "gallskrikarn@gmail.com",
      mail,
      transporter
    );
  }

  const { email, username, orgid } = emailAndOwner[0];

  const incident = await db("incident")
    .returning(["id", "subject"])
    .insert({
      subject,
      severity: null,
      content: reply,
      orgid,
      username,
      status: "New",
      category: null
    });

  let transporter = transporterInfo.loginMail();

  let info = transporterInfo.sendMailInfo(
    "new",
    `Incident with id ${incident[0].id} has been created`,
    `<div id="incidentid">${incident[0].id}</div><div>${reply}</div>
    <div>Subject of Incident ${incident[0].subject}</div>`,
    incident[0].id,
    email,
    transporter,
    "gallskrikarn@gmail.com",
    email
  );
};

module.exports = mailCreateIncident;
