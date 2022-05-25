const db = require("../db/db");

const incidentPoster = async (mail, incidentid, reply) => {
  const emailAndOwner = await db
    .select("email", "users.username")
    .from("incident")
    .innerJoin("users", "users.username", "incident.username")
    .where({ "users.email": mail })
    .andWhere({ "incident.id": incidentid });

  console.log(reply, incidentid, emailAndOwner[0].username);

  const insertToIncident = await db("incidentposts").insert({
    incidentid: incidentid,
    reply: reply,
    postusername: emailAndOwner[0].username
  });

  const updatePost = await db("incident").update({
    status: "Updated"
  });
};

module.exports = incidentPoster;
