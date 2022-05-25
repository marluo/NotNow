const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const mailReplyToIncident = require("../mailparser/mailReplyToIncident");
const transporterInfo = require("../utils/transporterInfo");
const decode = require("../middleware/decodeToken");

router.get("/api/incident/get", async (req, res) => {
  const incidents = await db
    .select("*")
    .from("incident")
    .join("organisation", "incident.orgid", "=", "organisation.orgid")
    .where({ status: "New" })
    .orWhere({ status: "Updated" });

  res.json(incidents);
});

router.get("/api/incident/id/:incidentId", async (req, res) => {
  const { incidentId } = req.params;
  console.log(incidentId);

  const incidents = await db
    .select("*")
    .from("incident")
    .join("users", "users.username", "=", "incident.username")
    .join("organisation", "users.orgid", "=", "organisation.orgid")
    .leftOuterJoin(
      "incidentposts",
      "incident.id",
      "=",
      "incidentposts.incidentid"
    )
    .where({ "incident.id": req.params.incidentId })
    .orderBy("incidentposts.postdate", "desc");

  res.json(incidents);
});

router.post("/api/incident/id/reply", async (req, res) => {
  const { id, reply, siterole, username } = req.body;
  console.log(siterole);

  const statusUpdate = siterole === "agent" ? "Awaiting Customer" : "Updated";

  console.log(statusUpdate);

  const incident = await db.raw(`
  WITH inserted AS (
    INSERT INTO incidentposts(incidentid, reply, postusername, postdate) VALUES(${id}, '${reply}', '${username}', now()) RETURNING *
),
updated as (
    UPDATE incident SET status='${statusUpdate}', updated_at=now() where id='${id}' RETURNING *
)

SELECT *
FROM inserted
INNER JOIN updated ON inserted.incidentid = updated.id
INNER JOIN users ON updated.username = users.username`);

  res.json(incident.rows[0]);

  let transporter = transporterInfo.loginMail();

  //cant destructure shit fuck my life!

  let info = transporterInfo.sendMailInfo(
    "reply",
    `Incident with id ${incident.rows[0].id} has been updated`,
    `<div id="incidentid">${incident.rows[0].id}</div><div>${incident.rows[0].reply}</div>
    <div>Subject of Incident ${incident.rows[0].subject}</div>`,
    "gallskrikarn@gmail.com",
    incident.rows[0].email,
    transporter
  );

  return;
});

router.post("/api/incident/new", decode, async (req, res) => {
  const { severity, orgid, subject, status, category, text } = req.body;

  const incident = await db("incident")
    .returning(["id"])
    .insert({
      subject,
      severity: severity,
      content: text,
      orgid,
      username: req.username,
      status: "New",
      category: category
    });

  return res.json(incident[0].id);
});

router.put("/api/incident/update", async (req, res) => {
  const { severity, status, category, subject, id } = req.body;
  const severityNumber = severity.substring(0, 1);

  try {
    const incident = await db("incident")
      .returning("severity", "status", "category")
      .update({
        severity: severityNumber,
        status,
        category,
        subject
      })
      .where({ id });

    return res.json(incident);
  } catch (error) {}
});

module.exports = router;
