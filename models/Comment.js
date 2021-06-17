const mongoose = require("mongoose");
const File = require('./File')(mongoose);

const commentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  created: { 
    type: Date, 
    default: Date.now,
  },
  updated: { 
    type: Date, 
    default: Date.now,
  },
  files: [File.schema]
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;