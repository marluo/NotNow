const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  incident_type: {
    type: String,
    required: true
  },
  severity: {
    type: Number,
    required: true
  },
  Product: {
    version: {
      type: String,
      required: true
    },
    other: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    required: true
  }
});

const Incident = mongoose.model("Incident", IncidentSchema);

module.exports = Incident;
