const mongoose = require('mongoose');

const PolicyholderSchema = new mongoose.Schema({
  policyholderId: String,
  name: String,
  contactNo: String,
  dateOfBirth: String, 
});

const PolicySchema = new mongoose.Schema({
  policyId: String,
  policyholderId: String,
  amount: Number,
  premium: Number,
  startDate: String,
  endDate: String,
  claimedAmount: { type: Number, default: 0 } // Initialize claimedAmount with default value 0
});

const ClaimSchema = new mongoose.Schema({
  claimId: String,
  policyId: String,
  claimAmount: Number,
  claimDate: String,
});

const Policyholder = mongoose.model('Policyholder', PolicyholderSchema);
const Policy = mongoose.model('Policy', PolicySchema);
const Claim = mongoose.model('Claim', ClaimSchema);

module.exports = { Policyholder, Policy, Claim };
