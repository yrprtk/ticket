const mongoose = require('mongoose');
const File = require('./File')(mongoose);
const Comment = require('./Comment')(mongoose);

const ticketSchema = new mongoose.Schema({
  sn: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  engineer_id: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['new', 'appointed', 'close', 'archive'],
    default: 'new',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  files: [File.schema],
  comments: [Comment.schema],
});

ticketSchema.pre('updateOne', () => {
  this.set({ updated: new Date() });
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
