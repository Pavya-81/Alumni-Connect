
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Connection = require('../models/Connection');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// Check whether user can participate in connections
async function getEligibleUser(userId) {
  return await User.findOne({
    _id: userId,
    $or: [
      {
        role: 'Student',
        verificationStatus: 'Approved'
      },
      {
        role: 'Alumni',
        verificationStatus: 'Approved'
      }
    ]
  });
}

// POST /api/connections/send/:userId
// Send or resend a connection request
router.post('/send/:userId', verifyToken, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        message: 'Invalid user ID.'
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        message: 'You cannot connect with yourself.'
      });
    }

    const sender = await getEligibleUser(senderId);

    if (!sender) {
      return res.status(403).json({
        message: 'Only approved Students and Alumni can send requests.'
      });
    }

    const receiver = await User.findOne({
      _id: receiverId,
      role: 'Alumni',
      verificationStatus: 'Approved'
    });

    if (!receiver) {
      return res.status(404).json({
        message: 'Approved Alumni not found.'
      });
    }

    // Check existing request in either direction
    const existing = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {

      // Block duplicate pending requests
      if (existing.status === 'Pending') {
        return res.status(409).json({
          message: 'A connection request is already pending.',
          status: existing.status
        });
      }

      // Block duplicate accepted connections
      if (existing.status === 'Accepted') {
        return res.status(409).json({
          message: 'You are already connected.',
          status: existing.status
        });
      }

      // Allow resend if previous request was rejected
      if (existing.status === 'Rejected') {
        existing.sender = senderId;
        existing.receiver = receiverId;
        existing.status = 'Pending';

        await existing.save();

        return res.status(200).json({
          message: 'Connection request sent again successfully!',
          connection: existing
        });
      }
    }

    // Create a new request if no previous request exists
    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: 'Pending'
    });

    return res.status(201).json({
      message: 'Connection request sent successfully!',
      connection
    });

  } catch (error) {
    console.error('Send connection error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Connection request already exists.'
      });
    }

    return res.status(500).json({
      message: 'Failed to send connection request.'
    });
  }
});

// GET /api/connections/received
// View received pending requests
router.get('/received', verifyToken, async (req, res) => {
  try {
    const user = await getEligibleUser(req.user._id);

    if (!user || user.role !== 'Alumni') {
      return res.status(403).json({
        message: 'Only approved Alumni can view received requests.'
      });
    }

    const requests = await Connection.find({
      receiver: user._id,
      status: 'Pending'
    })
      .populate(
        'sender',
        'fullName email role company currentPosition profilePhoto'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests
    });

  } catch (error) {
    console.error('Received requests error:', error);

    return res.status(500).json({
      message: 'Failed to fetch received requests.'
    });
  }
});

// GET /api/connections/sent
// View sent requests
router.get('/sent', verifyToken, async (req, res) => {
  try {
    const user = await getEligibleUser(req.user._id);

    if (!user) {
      return res.status(403).json({
        message: 'Approved account required.'
      });
    }

    const requests = await Connection.find({
      sender: user._id
    })
      .populate(
        'receiver',
        'fullName email role company currentPosition profilePhoto'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests
    });

  } catch (error) {
    console.error('Sent requests error:', error);

    return res.status(500).json({
      message: 'Failed to fetch sent requests.'
    });
  }
});

// PATCH /api/connections/:id/respond
// Accept or reject a received request
router.patch('/:id/respond', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid request ID.'
      });
    }

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be Accepted or Rejected.'
      });
    }

    const user = await getEligibleUser(req.user._id);

    if (!user || user.role !== 'Alumni') {
      return res.status(403).json({
        message: 'Only approved Alumni can respond to requests.'
      });
    }

    const connection = await Connection.findOne({
      _id: req.params.id,
      receiver: user._id,
      status: 'Pending'
    });

    if (!connection) {
      return res.status(404).json({
        message: 'Pending request not found.'
      });
    }

    connection.status = status;
    await connection.save();

    return res.status(200).json({
      message: `Connection request ${status.toLowerCase()} successfully!`,
      connection
    });

  } catch (error) {
    console.error('Respond connection error:', error);

    return res.status(500).json({
      message: 'Failed to respond to request.'
    });
  }
});

// GET /api/connections
// View accepted connections
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await getEligibleUser(req.user._id);

    if (!user) {
      return res.status(403).json({
        message: 'Approved account required.'
      });
    }

    const connections = await Connection.find({
      status: 'Accepted',
      $or: [
        { sender: user._id },
        { receiver: user._id }
      ]
    })
      .populate(
        'sender',
        'fullName email role company currentPosition profilePhoto'
      )
      .populate(
        'receiver',
        'fullName email role company currentPosition profilePhoto'
      )
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      connections
    });

  } catch (error) {
    console.error('Connections error:', error);

    return res.status(500).json({
      message: 'Failed to fetch connections.'
    });
  }
});

// DELETE /api/connections/:id
// Disconnect an accepted connection
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid connection ID.'
      });
    }

    const user = await getEligibleUser(req.user._id);

    if (!user) {
      return res.status(403).json({
        message: 'Approved account required.'
      });
    }

    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      status: 'Accepted',
      $or: [
        { sender: user._id },
        { receiver: user._id }
      ]
    });

    if (!connection) {
      return res.status(404).json({
        message: 'Connection not found.'
      });
    }

    return res.status(200).json({
      message: 'Connection removed successfully!'
    });

  } catch (error) {
    console.error('Disconnect error:', error);

    return res.status(500).json({
      message: 'Failed to remove connection.'
    });
  }
});

module.exports = router;
