
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')

async function createAdmin() {
  try {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

    if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        'Please configure MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env'
      )
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error('Admin password must be at least 12 characters.')
    }

    await mongoose.connect(MONGO_URI)

    const email = ADMIN_EMAIL.trim().toLowerCase()
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      if (existingUser.role === 'Admin') {
        console.log('An Admin account already exists for this email.')
      } else {
        console.log(
          'This email belongs to an existing non-admin account. ' +
          'Choose a different email; no account was changed.'
        )
      }
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

    await User.create({
      fullName: 'Alumni Connect Admin',
      email,
      password: hashedPassword,
      role: 'Admin',
      verificationStatus: 'Not Required'
    })

    console.log('Admin account created successfully!')
    console.log(`Admin email: ${email}`)
    console.log('Keep your admin password private.')
  } catch (error) {
    console.error('Admin setup failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect().catch(() => {})
  }
}

createAdmin()
