const isAgent = (req, res, next) => {
  if (req.siterole !== "user") {
    res.json({ error: "eh ur an agent, this is for users!" });
  }
};

module.exports = isAgent;
