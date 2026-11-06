
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      default: 'Full-time'
    },
    mode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site'
    },
    experience: {
      type: String,
      default: 'Fresher'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    skills: {
      type: String,
      required: true,
      trim: true
    },
    applicationLink: {
      type: String,
      default: '',
      trim: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Job', jobSchema);
