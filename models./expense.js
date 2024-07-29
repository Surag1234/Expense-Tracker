const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  paid_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
