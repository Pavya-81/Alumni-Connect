
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication token required.'
      })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        message: 'User account not found.'
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.'
    })
  }
}

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      message: 'Admin access only.'
    })
  }

  next()
}

module.exports = { verifyToken, verifyAdmin }
