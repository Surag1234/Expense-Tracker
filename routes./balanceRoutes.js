const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/user');

// Calculate and fetch balance sheet
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    // Calculate balance for each user (simple example, adapt as needed)
    const balanceSheet = {}; // { userId: balance }
    expenses.forEach(expense => {
      if (!balanceSheet[expense.paid_by]) balanceSheet[expense.paid_by] = 0;
      balanceSheet[expense.paid_by] += expense.amount;
    });

    const result = await Promise.all(Object.keys(balanceSheet).map(async userId => {
      const user = await User.findById(userId);
      return { user: user.username, balance: balanceSheet[userId] };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
