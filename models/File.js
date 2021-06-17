const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalname: {
    type: String,
    required: true,
  },
  encoding: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
});

const File = mongoose.model("File", fileSchema);
module.exports = File;