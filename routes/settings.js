const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const decode = require("../middleware/decodeToken");

router.put("/api/settings/additem", async (req, res) => {
  const { table, setting, column } = req.body;

  const settings = await db(table)
    .returning("*")
    .insert({
      [column]: setting
    });

  res.json(settings);
});

router.get("/api/settings", async (req, res) => {
  const status = await db.select("*").from("status");
  const severity = await db.select("*").from("severity");
  const category = await db.select("*").from("category");

  res.json({ severity, status, category });
});

router.delete("/api/settings", async (req, res) => {
  const { id, table } = req.body;
  console.log(table, id);

  const settings = await db(table)
    .returning("*")
    .where("id", id)
    .del();

  return res.json(settings);
});

module.exports = router;
