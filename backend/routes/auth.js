const { verifyToken } = require('../middleware/authMiddleware');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload');

const router = express.Router();

// =====================================
// POST /api/auth/register
// =====================================
router.post(
    '/register',
    upload.fields([
        { name: 'studentIdDocument', maxCount: 1 },
        { name: 'alumniDocument', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const {
                fullName,
                email,
                password,
                confirmPassword,
                role,
                department,
                currentYear,
                graduationYear,
                company
            } = req.body;

            // Uploaded files
            const studentFile = req.files?.studentIdDocument?.[0];
            const alumniFile = req.files?.alumniDocument?.[0];

            // Validate required fields
            if (
                !fullName ||
                !email ||
                !password ||
                !confirmPassword ||
                !role
            ) {
                return res.status(400).json({
                    message: 'Please fill in all required fields.'
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: 'Passwords do not match.'
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    message: 'Password must be at least 8 characters.'
                });
            }

            if (!['Student', 'Alumni'].includes(role)) {
                return res.status(400).json({
                    message: 'Role must be Student or Alumni.'
                });
            }

            // Normalize email
            const normalizedEmail = email.trim().toLowerCase();

            // Check existing user
            const existingUser = await User.findOne({
                email: normalizedEmail
            });

            if (existingUser) {
                return res.status(409).json({
                    message: 'An account with this email already exists.'
                });
            }

            // Validate Student details
            if (role === 'Student') {
                if (!department || !currentYear || !studentFile) {
                    return res.status(400).json({
                        message:
                            'Department, current year, and Student ID document are required.'
                    });
                }

                if (!['1', '2', '3', '4'].includes(currentYear)) {
                    return res.status(400).json({
                        message: 'Please select a valid current year.'
                    });
                }
            }

            // Validate Alumni details
            if (role === 'Alumni') {
                const year = Number(graduationYear);

                if (
                    !department ||
                    !graduationYear ||
                    !Number.isInteger(year) ||
                    year < 1950 ||
                    year > new Date().getFullYear() ||
                    !alumniFile
                ) {
                    return res.status(400).json({
                        message:
                            'Enter a valid graduation year, department, and Alumni document.'
                    });
                }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // IMPORTANT:
            // Files are received in memory only.
            // Do not store the file objects in MongoDB.
            // Permanent document storage must be configured
            // before accepting real registrations.

            const user = new User({
                fullName: fullName.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role,
                department: department.trim(),

                currentYear:
                    role === 'Student' ? currentYear : '',

                graduationYear:
                    role === 'Alumni' ? Number(graduationYear) : null,

                company:
                    role === 'Alumni' ? (company || '').trim() : '',

                studentIdDocument:
    role === 'Student' && studentFile
        ? `uploads/${studentFile.filename}`
        : '',

alumniDocument:
    role === 'Alumni' && alumniFile
        ? `uploads/${alumniFile.filename}`
        : '',

                verificationStatus: 'Pending'
            });

            await user.save();

            return res.status(201).json({
                message:
                    'Registration saved. Document storage and verification must be completed before your account can be approved.',
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    verificationStatus: user.verificationStatus
                }
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    message: 'An account with this email already exists.'
                });
            }

            console.error('Registration error:', error.message);

            return res.status(500).json({
                message: 'Registration failed due to a server error.'
            });
        }
    }
);

// =====================================
// POST /api/auth/login
// =====================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }
        // Block Student and Alumni until Admin approves them
if (
    user.role !== 'Admin' &&
    user.verificationStatus !== 'Approved'
) {
    if (user.verificationStatus === 'Rejected') {
        return res.status(403).json({
            message:
                'Your application was rejected. Please contact the administrator.'
        });
    }

    return res.status(403).json({
        message:
            'Your account is pending admin verification. Please try again after approval.'
    });
}

        

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            message: 'Login failed due to a server error.'
        });
    }
});

// =====================================
// PUT /api/auth/update-profile
// Update logged-in Alumni profile
// =====================================
router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        // Only approved Alumni can update this profile
        if (
            user.role !== 'Alumni' ||
            user.verificationStatus !== 'Approved'
        ) {
            return res.status(403).json({
                message: 'Only approved Alumni can update their profile.'
            });
        }

        const {
            currentPosition,
            company,
            department,
            graduationYear,
            skills,
            bio
        } = req.body;

        // Validate graduation year
        if (graduationYear !== undefined) {
            const year = Number(graduationYear);

            if (
                !Number.isInteger(year) ||
                year < 1950 ||
                year > new Date().getFullYear()
            ) {
                return res.status(400).json({
                    message: 'Please enter a valid graduation year.'
                });
            }

            user.graduationYear = year;
        }

        // Update permitted fields only
        if (currentPosition !== undefined) {
            user.currentPosition = currentPosition.trim();
        }

        if (company !== undefined) {
            user.company = company.trim();
        }

        if (department !== undefined) {
            user.department = department.trim();
        }

        if (bio !== undefined) {
            user.bio = bio.trim();
        }

        if (skills !== undefined) {
            if (!Array.isArray(skills)) {
                return res.status(400).json({
                    message: 'Skills must be an array.'
                });
            }

            user.skills = skills
                .filter(skill => typeof skill === 'string')
                .map(skill => skill.trim())
                .filter(Boolean);
        }

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully!',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                verificationStatus: user.verificationStatus,
                currentPosition: user.currentPosition,
                company: user.company,
                department: user.department,
                graduationYear: user.graduationYear,
                skills: user.skills,
                bio: user.bio,
                profilePhoto: user.profilePhoto
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);

        return res.status(500).json({
            message: 'Failed to update profile.'
        });
    }
});

// =====================================
// GET /api/auth/me
// Fetch logged-in user's profile
// =====================================
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            user
        });

    } catch (error) {
        console.error('Fetch profile error:', error);

        return res.status(500).json({
            message: 'Failed to fetch profile.'
        });
    }
});

module.exports = router;
