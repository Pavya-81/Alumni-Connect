
const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/User');

// GET /api/alumni
// Fetch all approved Alumni only
router.get('/', async (req, res) => {
  try {
    const alumni = await User.find({
      role: 'Alumni',
      verificationStatus: 'Approved'
    })
      .select(
        'fullName role department graduationYear company currentPosition skills bio profilePhoto'
      )
      .sort({ fullName: 1 });

    return res.status(200).json({
      message: 'Alumni fetched successfully!',
      alumni
    });

  } catch (error) {
    console.error('Fetch alumni error:', error);

    return res.status(500).json({
      message: 'Failed to fetch alumni.'
    });
  }
});

// GET /api/alumni/:id
// Fetch one approved Student OR Alumni profile
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid user ID.'
      });
    }

    const person = await User.findOne({
      _id: req.params.id,
      role: { $in: ['Student', 'Alumni'] },
      verificationStatus: 'Approved'
    }).select(
      'fullName role department currentYear graduationYear company currentPosition skills bio profilePhoto'
    );

    if (!person) {
      return res.status(404).json({
        message: 'Profile not found or not approved.'
      });
    }

    return res.status(200).json({
      message: 'Profile fetched successfully!',
      person
    });

  } catch (error) {
    console.error('Fetch profile error:', error);

    return res.status(500).json({
      message: 'Failed to fetch profile.'
    });
  }
});

module.exports = router;
