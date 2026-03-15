const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  questionsSolved: {
    type: Number,
    required: true,
    min: 0
  },
  topics: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    default: ""
  }
}, { timestamps: true });

// Prevent multiple progress entries for the same goal on the same date
ProgressSchema.index({ goalId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
