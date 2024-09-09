const express = require('express');
const router = express.Router();
const { Policyholder, Policy, Claim } = require('../models/models');
const moment = require('moment');
const { registerUser, loginUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');


// Middleware to parse JSON bodies
router.use(express.json());

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Create functions
const createPolicyholder = async (policyholder) => {
  if (policyholder.dateOfBirth) {
    policyholder.dateOfBirth = new Date(policyholder.dateOfBirth).toISOString().split('T')[0];
  }
  
  const newPolicyholder = new Policyholder(policyholder);
  await newPolicyholder.save();
  return newPolicyholder;
};

const createPolicy = async (policy) => {
  try {
    return await Policy.create(policy);
  } catch (error) {
    throw new Error('Policy creation failed');
  }
};

const createClaim = async (claim) => {
  try {
    const policy = await Policy.findOne({ policyId: claim.policyId });
    if (!policy) {
      throw new Error('Associated policy not found');
    }

    if (!policy.claimedAmount) {
      policy.claimedAmount = 0;
    }

    const remainingAmount = policy.amount - policy.claimedAmount;
    if (claim.claimAmount > remainingAmount) {
      throw new Error('Claim amount exceeds the remaining policy amount');
    }

    const newClaim = await Claim.create(claim);
    policy.claimedAmount += claim.claimAmount;
    await policy.save();
    return newClaim;
  } catch (error) {
    throw new Error('Claim creation failed: ' + error.message);
  }
};

// Read functions
const getAllPolicyholders = async () => {
  try {
    return await Policyholder.find();
  } catch (error) {
    throw new Error('Failed to fetch policyholders');
  }
};

const getAllPolicies = async () => {
  try {
    return await Policy.find();
  } catch (error) {
    throw new Error('Failed to fetch policies');
  }
};

const getAllClaims = async () => {
  try {
    return await Claim.find();
  } catch (error) {
    throw new Error('Failed to fetch claims');
  }
};

// Update functions
const updatePolicy = async (policyId, updatedData) => {
  try {
    return await Policy.findOneAndUpdate({ policyId }, updatedData, { new: true });
  } catch (error) {
    throw new Error('Failed to update policy');
  }
};

const updateClaim = async (claimId, updatedData) => {
  try {
    const existingClaim = await Claim.findOne({ claimId });
    if (!existingClaim) {
      throw new Error('Claim not found');
    }

    const policy = await Policy.findOne({ policyId: existingClaim.policyId });
    if (!policy) {
      throw new Error('Associated policy not found');
    }

    const newClaimAmount = updatedData.claimAmount || existingClaim.claimAmount;
    const remainingAmount = policy.amount - policy.claimedAmount + existingClaim.claimAmount;

    if (newClaimAmount > remainingAmount) {
      throw new Error('Updated claim amount exceeds the remaining policy amount for the year');
    }

    policy.claimedAmount = policy.claimedAmount - existingClaim.claimAmount + newClaimAmount;
    await policy.save();

    const updatedClaim = await Claim.findOneAndUpdate({ claimId }, updatedData, { new: true });
    return updatedClaim;
  } catch (error) {
    throw new Error('Failed to update claim: ' + error.message);
  }
};

// Delete functions
const deletePolicy = async (policyId) => {
  try {
    return await Policy.findOneAndDelete({ policyId });
  } catch (error) {
    throw new Error('Failed to delete policy');
  }
};

const deleteClaim = async (claimId) => {
  try {
    const claim = await Claim.findOne({ claimId });
    if (!claim) {
      throw new Error('Claim not found');
    }

    const policy = await Policy.findOne({ policyId: claim.policyId });
    if (!policy) {
      throw new Error('Associated policy not found');
    }

    policy.claimedAmount -= claim.claimAmount;
    await policy.save();

    await Claim.findOneAndDelete({ claimId });
  } catch (error) {
    throw new Error('Failed to delete claim: ' + error.message);
  }
};

//Routes for the register and login
router.post('/register', registerUser);
router.post('/login', loginUser);



// Routes for Policyholders
router.post('/policyholders', authenticateToken, async (req, res) => {
  try {
    const existingPolicyholder = await Policyholder.findOne({ policyholderId: req.body.policyholderId });

    if (existingPolicyholder) {
      // If policyholder already exists, return a conflict error
      return res.status(409).json({ error: 'Policyholder with this ID already exists' });
    } else {
      // Create a new policyholder
      const newPolicyholder = await createPolicyholder(req.body);
      res.status(201).json(newPolicyholder);
    }
  } catch (error) {
    console.error('Error adding policyholder:', error);
    res.status(500).json({ error: 'Failed to add policyholder' });
  }
});

router.get('/policyholders', authenticateToken, async (req, res) => {
  try {
    const allPolicyholders = await getAllPolicyholders();
    res.send(allPolicyholders);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/policyholders/:id', authenticateToken, async (req, res) => {
  const policyholderId = req.params.id;
  try {
    const policyholder = await Policyholder.findOne({ policyholderId });
    if (policyholder) {
      res.send(policyholder);
    } else {
      res.status(404).send('Policyholder not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update policyholder
router.put('/policyholders/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const policyholder = await Policyholder.findOne({ policyholderId: id });

    if (!policyholder) {
      return res.status(404).json({ error: 'Policyholder not found' });
    }

    // Update fields if they exist in the request body
    if (req.body.name) policyholder.name = req.body.name;
    if (req.body.email) policyholder.email = req.body.email;
    if (req.body.contactNo) policyholder.contactNo = req.body.contactNo;
    if (req.body.dateOfBirth) policyholder.dateOfBirth = req.body.dateOfBirth;

    await policyholder.save();

    console.log('Updated policyholder:', policyholder);
    res.status(200).json(policyholder);
  } catch (error) {
    console.error('Error updating policyholder:', error);
    res.status(500).json({ error: 'Failed to update policyholder' });
  }
});

// Delete policyholder
router.delete('/policyholders/:policyholderId', authenticateToken, async (req, res) => {
  try {
    const policyholder = await Policyholder.findOneAndDelete({ policyholderId: req.params.policyholderId });
    if (!policyholder) {
      return res.status(404).json({ error: 'Policyholder not found' });
    }
    res.status(200).json({ message: 'Policyholder deleted successfully' });
  } catch (error) {
    console.error('Error deleting policyholder:', error);
    res.status(500).json({ error: 'Failed to delete policyholder' });
  }
});

// Routes for Policies
router.post('/policies', authenticateToken, async (req, res) => {
  const policy = req.body;
  try {
    const newPolicy = await createPolicy(policy);
    res.status(201).send(newPolicy);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/policies', authenticateToken, async (req, res) => {
  try {
    const allPolicies = await getAllPolicies();
    res.send(allPolicies);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/policies/:id', authenticateToken, async (req, res) => {
  const policyId = req.params.id;
  try {
    const policy = await Policy.findOne({ policyId });
    if (policy) {
      res.send(policy);
    } else {
      res.status(404).send('Policy not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/policies/:id', authenticateToken, async (req, res) => {
  const policyId = req.params.id;
  const updatedData = req.body;
  try {
    await updatePolicy(policyId, updatedData);
    res.send('Policy updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/policies/:id', authenticateToken, async (req, res) => {
  const policyId = req.params.id;
  try {
    await deletePolicy(policyId);
    res.status(204).send();
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Routes for Claims
router.post('/claims', authenticateToken, async (req, res) => {
  const claim = req.body;
  try {
    const newClaim = await createClaim(claim);
    res.status(201).send(newClaim);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/claims', authenticateToken, async (req, res) => {
  try {
    const allClaims = await getAllClaims();
    res.send(allClaims);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/claims/:id', authenticateToken, async (req, res) => {
  const claimId = req.params.id;
  try {
    const claim = await Claim.findOne({ claimId });
    if (claim) {
      res.send(claim);
    } else {
      res.status(404).send('Claim not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/claims/:id', authenticateToken, async (req, res) => {
  const claimId = req.params.id;
  const updatedData = req.body;
  try {
    const updatedClaim = await updateClaim(claimId, updatedData);
    res.send(updatedClaim);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/claims/:id', authenticateToken, async (req, res) => {
  const claimId = req.params.id;
  try {
    await deleteClaim(claimId);
    res.status(204).send();
  } catch (error) {
    res.status(400).send(error.message);
  }
});


module.exports = router;
