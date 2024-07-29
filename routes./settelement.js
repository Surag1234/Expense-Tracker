const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Settlement', settlementSchema);
