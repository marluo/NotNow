const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");

router.get("/api/organisation/get", async (req, res) => {
  const orgInc = await db
    .select("*")
    .from("organisation")
    .join("incident", "organisation.orgid", "=", "incident.orgid");
  res.json(orgInc);
});

router.get("/api/organisation/all", async (req, res) => {
  const organisations = await db
    .select("orgname", "orgid")
    .from("organisation");

  res.json(organisations);
});

router.post("/api/organisation/regsearch", async (req, res) => {
  const { search } = req.body;

  const searchOrgs = await db.raw(
    `SELECT distinct orgname, orgid from organisation WHERE orgname iLIKE '%${search}%'`
  );

  return res.json(searchOrgs);
});

/* select * from incident, incidentposts
where incident.id = incidentposts.incidentid and incident.id = 2 */

module.exports = router;
