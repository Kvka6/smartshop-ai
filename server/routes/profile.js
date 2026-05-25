const express = require('express');
const router = express.Router();

// In-memory store (in production, use a DB like SQLite/PostgreSQL)
let profileStore = {};

router.get('/', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  res.json(profileStore[sessionId] || getDefaultProfile());
});

router.post('/', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const {
    gender,
    shirtSize,
    pantSize,
    shoeSize,
    budgetClothingMin,
    budgetClothingMax,
    budgetElectronicsMin,
    budgetElectronicsMax,
    preferredBrands,
    country,
  } = req.body;

  // Basic validation
  const validGenders = ['male', 'female', 'unisex'];
  const validShirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  if (gender && !validGenders.includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender value.' });
  }
  if (shirtSize && !validShirtSizes.includes(shirtSize)) {
    return res.status(400).json({ error: 'Invalid shirt size.' });
  }
  if (pantSize && (isNaN(pantSize) || Number(pantSize) < 26 || Number(pantSize) > 48)) {
    return res.status(400).json({ error: 'Pant size must be between 26 and 48.' });
  }

  profileStore[sessionId] = {
    gender: gender || 'male',
    shirtSize: shirtSize || 'M',
    pantSize: pantSize || '32',
    shoeSize: shoeSize || '9',
    budgetClothingMin: Number(budgetClothingMin) || 0,
    budgetClothingMax: Number(budgetClothingMax) || 5000,
    budgetElectronicsMin: Number(budgetElectronicsMin) || 0,
    budgetElectronicsMax: Number(budgetElectronicsMax) || 50000,
    preferredBrands: preferredBrands || [],
    country: country || 'IN',
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, profile: profileStore[sessionId] });
});

function getDefaultProfile() {
  return {
    gender: 'male',
    shirtSize: 'M',
    pantSize: '32',
    shoeSize: '9',
    budgetClothingMin: 0,
    budgetClothingMax: 3000,
    budgetElectronicsMin: 0,
    budgetElectronicsMax: 30000,
    preferredBrands: [],
    country: 'IN',
  };
}

module.exports = router;
