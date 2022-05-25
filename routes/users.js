const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const decode = require("../middleware/decodeToken");

require("dotenv").config();

/*
@query - GET ALL REGISTERED USERS
@route - /api/user/users
@privacy - public
*/

router.get("/api/user/users", async (req, res) => {
  const users = await db.select("*").from("users");
  res.json(user);
});

/*
@query - GET ALL USERS WHO ARE WAITING/NOT REGISTERED
@route - /api/user/users
@privacy - public
*/

/*router.get("/api/user/activated", async (req, res) => {
  const users = await db
    .select("*")
    .from("users")
    .where({ activated: false });
  res.json(users);
});*/

/*
@query - UPDATE A USER FROM NOT REGISTERED TO REGISTERED
@route - /api/user/users
@privacy - public
*/

router.post("/api/users/activated", async (req, res) => {
  const { userToActivate } = req.body;
  console.log(userToActivate);

  const user = await db("users")
    .returning("username")
    .update({
      activated: true
    })
    .where({ username: userToActivate });

  res.json(user[0]);
});

/*
@query - GET INFORMATION ABOUT AN ORGANISATION, INCIDENTS AND USERS WHO ARE PART OF IT
@route - /api/user/users
@privacy - public
@TODO - UPDATE JOIN TO INCLUDE INCIDENTS
*/

router.get("/api/users/organisation", async (req, res) => {
  const { orgid } = req.body;

  /* DOING THIS BECAUSE EASIER TO HANDLE THE DATA THIS WAY  */
  const org = await db
    .select("*")
    .from("organisation")
    .where({ orgid: orgid });
  const users = await db
    .select("*")
    .from("users")
    .where({ orgid: orgid });
  const incident = await db
    .select("*")
    .from("incident")
    .where({ orgid: orgid });

  /*const org = await db
    .select(
      "users.firstname as firstName",
      "users.lastname as lastName",
      "users.orgid",
      "users.jobrole as jobRole",
      "users.email as userEmail",
      "users.username as username",
      "incident.id as incidentID",
      "organisation.orgname as orgname"
    )
    .from("users", "organisation", "incident")
    .innerJoin("organisation", { "users.orgid": "organisation.orgid" })
    .innerJoin("incident", { "incident.orgid": "organisation.orgid" })
    .where({ "organisation.orgid": orgid });
  console.log(org);*/
  res.json({ org, users, incident });
});

router.post("/api/user/register", async (req, res) => {
  try {
    const {
      username,
      password,
      firstname,
      lastname,
      email,
      organisation,
      jobrole,
      text
    } = req.body.fields;
    //CRYPT PASSWORD
    const { key } = organisation;

    var encryptedPW = bcrypt.hashSync(password, 8);

    //jsonwebtoken

    //Drop down of organisations

    await db("users").insert({
      username,
      password: encryptedPW,
      firstname,
      lastname,
      email,
      orgid: key,
      jobrole,
      siterole: "user",
      activated: false
    });

    jwt.sign(
      {
        username,
        firstname,
        lastname,
        orgid: key,
        siterole: "user",
        activated: false
      },
      process.env.JWTSECRET,
      function(err, token) {
        res.cookie("token", token, {
          httpOnly: false
        });
        res.json(token);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

/*
@query - LOGIN USER AND GET TOKEN TO CLIENT
@route - /api/user/users
@privacy - public
@TODO - UPDATE JOIN TO INCLUDE INCIDENTS
*/

router.post("/api/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    //CRYPT PASSWORD

    const user = await db
      .select(
        "username",
        "password",
        "firstname",
        "lastname",
        "orgid",
        "activated"
      )
      .from("users")
      .where({ username });

    const pwCheck = await bcrypt.compare(password, user[0].password);

    if (!pwCheck) {
      res.status(404).json({ message: "Incorrect username or password" });
    }

    const token = jwt.sign(
      {
        username: user[0].username,
        firstName: user[0].firstname,
        lastName: user[0].lastname,
        orgid: user[0].orgid,
        activated: user[0].activated
      },
      process.env.JWTSECRET
    );

    res.cookie("token", token, {
      httpOnly: false
    });

    return res.send({
      user: {
        user: user[0].username,
        username: user[0].username,
        firstName: user[0].firstname,
        lastName: user[0].lastname,
        orgid: user[0].orgid
      },
      token: token
    });

    //jsonwebtoken

    //Drop down of organisations
  } catch (error) {
    console.log(error);
  }
});

router.get("/api/user/auth", decode, async (req, res) => {
  try {
    //CRYPT PASSWORD
    const user = await db
      .select(
        "users.username",
        "users.password",
        "users.firstname",
        "users.lastname",
        "users.orgid",
        "organisation.orgname",
        "users.activated"
      )
      .from("users")
      .innerJoin("organisation", "organisation.orgid", "=", "users.orgid")
      .where({ username: req.username });

    return res.send({
      user: {
        user: user[0].username,
        username: user[0].username,
        firstName: user[0].firstname,
        lastName: user[0].lastname,
        orgid: user[0].orgid,
        orgname: user[0].orgname,
        activated: user[0].activated
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/api/users/activated", async (req, res) => {
  console.log(req);
  const users = await db
    .select(
      "users.username",
      "users.firstname",
      "users.lastname",
      "users.email",
      "users.orgid",
      "users.activated",
      "users.siterole",
      "organisation.orgname",
      "users.jobrole"
    )
    .from("users")
    .innerJoin("organisation", "organisation.orgid", "=", "users.orgid")
    .where({ activated: false });

  res.json({ users: users, count: users.length });
});

module.exports = router;
