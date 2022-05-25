const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");

router.get("/api/statistics", async (req, res) => {
  const statistics = await db.raw(`select date_trunc('hour', created_at), CAST(count(*) as int)  from incident
where date(created_at) >= date(CURRENT_DATE - INTERVAL '7 DAY') and date(CURRENT_DATE) >= date(created_at)
group by date_trunc('hour', created_at)`);
  //using interval + 1 because otherwise it will subtract 1 day

  const stats = await db("incident")
    .select("created_at")
    .count("created_at")
    .groupBy("created_at");

  const pieChart = await db.raw(`SELECT category, CAST(COUNT(*) as int)
FROM incident
GROUP BY category`);

  res.json({ stats: statistics.rows, pie: pieChart.rows });
});

module.exports = router;
