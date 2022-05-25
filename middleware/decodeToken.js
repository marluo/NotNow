const jwt = require("jsonwebtoken");
require("dotenv").config();

const decodeToken = (req, res, next) => {
  const token = req.cookies.token;

  const decoded = jwt.verify(token, process.env.JWTSECRET);
  req.username = decoded.username;
  req.firstName = decoded.lastName;
  req.orgid = decoded.orgid;
  req.siterole = decoded.siterole;
  next();
};

module.exports = decodeToken;
