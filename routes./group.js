const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: { type: [String], required: true },
  totalAmount: { type: Number, required: true },
  splitMethod: { type: String, required: true, enum: ['exact', 'percentage'] },
  splitDetails: [
    {
      email: { type: String, required: true },
      amount: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }
  ]
});

// Method to calculate balance sheet
groupSchema.methods.calculateBalanceSheet = function() {
  const balances = {};
  this.members.forEach(member => {
    balances[member] = 0; // Initialize balances
  });

  if (this.splitMethod === 'exact') {
    this.splitDetails.forEach(detail => {
      if (detail.amount) {
        balances[detail.email] = (balances[detail.email] || 0) - detail.amount;
      }
    });
  } else if (this.splitMethod === 'percentage') {
    this.splitDetails.forEach(detail => {
      if (detail.percentage) {
        const amount = (detail.percentage / 100) * this.totalAmount;
        balances[detail.email] = (balances[detail.email] || 0) - amount;
      }
    });
  }

  // Distribute totalAmount equally or based on percentage
  const equalShare = this.totalAmount / this.members.length;
  this.members.forEach(member => {
    balances[member] += equalShare;
  });

  return balances;
};

// Method to calculate settlement sheet
groupSchema.methods.calculateSettlementSheet = function() {
  const balances = this.calculateBalanceSheet();
  const settlements = [];
  const creditors = [];
  const debtors = [];

  // Separate creditors and debtors
  for (const [member, balance] of Object.entries(balances)) {
    if (balance > 0) {
      creditors.push({ member, balance });
    } else if (balance < 0) {
      debtors.push({ member, balance });
    }
  }

  // Match debtors with creditors
  while (debtors.length && creditors.length) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(-debtor.balance, creditor.balance);

    settlements.push({
      from: debtor.member,
      to: creditor.member,
      amount
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) debtors.shift();
    if (creditor.balance === 0) creditors.shift();
  }

  return settlements;
};

module.exports = mongoose.model('Group', groupSchema);
