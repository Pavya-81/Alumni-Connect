
const express = require('express')
const User = require('../models/User')
const {
  verifyToken,
  verifyAdmin
} = require('../middleware/authMiddleware')

const router = express.Router()

// GET /api/admin/pending
// View pending Student and Alumni applications
router.get('/pending', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ['Student', 'Alumni'] },
      verificationStatus: 'Pending'
    })
      .select('-password')
      .sort({ createdAt: -1 })

    res.status(200).json({ users })
  } catch (error) {
    console.error('Fetch pending applications error:', error.message)
    res.status(500).json({
      message: 'Unable to fetch pending applications.'
    })
  }
})

// PATCH /api/admin/:id/approve
router.patch('/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: { $in: ['Student', 'Alumni'] },
        verificationStatus: 'Pending'
      },
      {
        $set: {
          verificationStatus: 'Approved',
          rejectionReason: ''
        }
      },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'Pending application not found.'
      })
    }

    res.status(200).json({
      message: 'Application approved successfully.',
      user
    })
  } catch (error) {
    console.error('Approve application error:', error.message)
    res.status(500).json({
      message: 'Unable to approve application.'
    })
  }
})

// PATCH /api/admin/:id/reject
router.patch('/:id/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const reason =
      typeof req.body.reason === 'string' ? req.body.reason.trim() : ''

    if (!reason) {
      return res.status(400).json({
        message: 'Please provide a rejection reason.'
      })
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: { $in: ['Student', 'Alumni'] },
        verificationStatus: 'Pending'
      },
      {
        $set: {
          verificationStatus: 'Rejected',
          rejectionReason: reason
        }
      },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'Pending application not found.'
      })
    }

    res.status(200).json({
      message: 'Application rejected.',
      user
    })
  } catch (error) {
    console.error('Reject application error:', error.message)
    res.status(500).json({
      message: 'Unable to reject application.'
    })
  }
})

module.exports = router
