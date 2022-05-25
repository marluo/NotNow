const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");

router.get("/api/incident/get", async (req, res) => {
  const incidents = await db.select("*").from("incident");

  console.log("lol");
});

module.exports = router;
