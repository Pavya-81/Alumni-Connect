const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ['Student', 'Alumni', 'Admin'],
            required: true
        },

        department: {
            type: String,
            default: ''
        },

        // Student details
        currentYear: {
            type: String,
            default: ''
        },

        studentIdDocument: {
            type: String,
            default: ''
        },

        // Alumni details
        graduationYear: {
            type: Number,
            default: null
        },

        company: {
            type: String,
            default: ''
        },
        currentPosition: {
    type: String,
    default: ''
},

        alumniDocument: {
            type: String,
            default: ''
        },

        // Admin verification
        verificationStatus: {
            type: String,
            enum: ['Not Required', 'Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },

        rejectionReason: {
            type: String,
            default: ''
        },

        bio: {
            type: String,
            default: ''
        },

        skills: {
            type: [String],
            default: []
        },

        profilePhoto: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);