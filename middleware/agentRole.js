const isAgent = (req, res, next) => {
  if (req.siterole !== "agent") {
    res.json({ error: "You are not an agent! Dont try to cheat!" });
  }
};

module.exports = isAgent;
