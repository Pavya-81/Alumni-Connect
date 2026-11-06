
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Message = require('../models/Message');
const Connection = require('../models/Connection');
const User = require('../models/User');

const { verifyToken } = require('../middleware/authMiddleware');

// Check approved Student or Alumni
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

// Check whether two users are connected
async function areConnected(userId, otherUserId) {
  return await Connection.findOne({
    status: 'Accepted',
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId }
    ]
  });
}

// POST /api/messages/:userId
// Send a message to an accepted connection
router.post('/:userId', verifyToken, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;
    const messageText = req.body.message?.trim();

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        message: 'Invalid receiver ID.'
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        message: 'You cannot message yourself.'
      });
    }

    if (!messageText) {
      return res.status(400).json({
        message: 'Message cannot be empty.'
      });
    }

    if (messageText.length > 2000) {
      return res.status(400).json({
        message: 'Message cannot exceed 2000 characters.'
      });
    }

    const sender = await getEligibleUser(senderId);

    if (!sender) {
      return res.status(403).json({
        message: 'Approved account required.'
      });
    }

    const receiver = await getEligibleUser(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: 'Approved user not found.'
      });
    }

    // Only accepted connections can message
    const connection = await areConnected(senderId, receiverId);

    if (!connection) {
      return res.status(403).json({
        message: 'You can only message accepted connections.'
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: messageText
    });

    return res.status(201).json({
      message: 'Message sent successfully!',
      chatMessage: newMessage
    });

  } catch (error) {
    console.error('Send message error:', error);

    return res.status(500).json({
      message: 'Failed to send message.'
    });
  }
});

// GET /api/messages/:userId
// Fetch chat history and other user's details

// GET /api/messages/unread-count
// Get total unread messages for logged-in user
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const user = await getEligibleUser(req.user._id);

    if (!user) {
      return res.status(403).json({
        message: 'Approved account required.'
      });
    }

    const unreadCount = await Message.countDocuments({
      receiver: user._id,
      isRead: false
    });

    return res.status(200).json({
      unreadCount
    });

  } catch (error) {
    console.error('Unread count error:', error);

    return res.status(500).json({
      message: 'Failed to fetch unread count.'
    });
  }
});
// UNREAD NOTIFICATIONS ROUTE
router.get('/unread-notifications', verifyToken, async (req, res) => {
  try {
    const user = await getEligibleUser(req.user._id)

    if (!user) {
      return res.status(403).json({
        message: 'Only approved students and alumni can view notifications.'
      })
    }

    const unreadMessages = await Message.find({
      receiver: user._id,
      isRead: false
    })
      .populate('sender', 'fullName role company currentPosition profilePhoto')
      .sort({ createdAt: -1 })

    const groupedNotifications = {}

    unreadMessages.forEach((msg) => {
      if (!msg.sender) return

      const senderId = msg.sender._id.toString()

      if (!groupedNotifications[senderId]) {
        groupedNotifications[senderId] = {
          sender: msg.sender,
          unreadCount: 0,
          latestMessage: msg.message,
          latestMessageTime: msg.createdAt
        }
      }

      groupedNotifications[senderId].unreadCount++
    })

    const notifications = Object.values(groupedNotifications)

    res.status(200).json({
      totalUnread: unreadMessages.length,
      notifications
    })

  } catch (error) {
    console.error('Unread notifications error:', error)

    res.status(500).json({
      message: 'Unable to fetch unread notifications.'
    })
  }
})



router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        message: 'Invalid user ID.'
      });
    }

    if (currentUserId.toString() === otherUserId) {
      return res.status(400).json({
        message: 'Invalid chat user.'
      });
    }

    const currentUser = await getEligibleUser(currentUserId);

    if (!currentUser) {
      return res.status(403).json({
        message: 'Approved account required.'
      });
    }

    const otherUser = await getEligibleUser(otherUserId);

    if (!otherUser) {
      return res.status(404).json({
        message: 'Approved user not found.'
      });
    }

    // Check accepted connection
    const connection = await areConnected(
      currentUserId,
      otherUserId
    );

    if (!connection) {
      return res.status(403).json({
        message: 'You can only view chats with accepted connections.'
      });
    }
    // Mark received messages as read
await Message.updateMany(
  {
    sender: otherUserId,
    receiver: currentUserId,
    isRead: false
  },
  {
    $set: { isRead: true }
  }
);

    // Fetch messages
    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: otherUserId
        },
        {
          sender: otherUserId,
          receiver: currentUserId
        }
      ]
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
      otherUser: {
        _id: otherUser._id,
        fullName: otherUser.fullName,
        role: otherUser.role,
        company: otherUser.company,
        currentPosition: otherUser.currentPosition,
        profilePhoto: otherUser.profilePhoto
      }
    });

  } catch (error) {
    console.error('Fetch messages error:', error);

    return res.status(500).json({
      message: 'Failed to fetch messages.'
    });
  }
});

module.exports = router;
