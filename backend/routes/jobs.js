
const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Job = require('../models/Job');
const { verifyToken } = require('../middleware/authMiddleware');

// Check whether the user is an approved Alumni
const checkApprovedAlumni = (req, res) => {
  if (
    req.user.role !== 'Alumni' ||
    req.user.verificationStatus !== 'Approved'
  ) {
    res.status(403).json({
      message: 'Only approved Alumni can manage jobs.'
    });
    return false;
  }

  return true;
};

// GET /api/jobs - Fetch all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Jobs fetched successfully!',
      jobs
    });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return res.status(500).json({
      message: 'Failed to fetch jobs.'
    });
  }
});

// GET /api/jobs/my-jobs - Fetch logged-in Alumni's jobs
router.get('/my-jobs', verifyToken, async (req, res) => {
  try {
    if (!checkApprovedAlumni(req, res)) return;

    const jobs = await Job.find({
      postedBy: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Your posted jobs fetched successfully!',
      jobs
    });
  } catch (error) {
    console.error('My jobs error:', error);
    return res.status(500).json({
      message: 'Failed to fetch your posted jobs.'
    });
  }
});

// POST /api/jobs - Post a new job
router.post('/', verifyToken, async (req, res) => {
  try {
    if (!checkApprovedAlumni(req, res)) return;

    const {
      title, company, location, type, mode,
      experience, description, skills, applicationLink
    } = req.body;

    if (
      !title?.trim() ||
      !company?.trim() ||
      !location?.trim() ||
      !description?.trim() ||
      !skills?.trim()
    ) {
      return res.status(400).json({
        message: 'Please provide all required job details.'
      });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      mode,
      experience,
      description: description.trim(),
      skills: skills.trim(),
      applicationLink: applicationLink?.trim() || '',
      postedBy: req.user._id
    });

    return res.status(201).json({
      message: 'Job posted successfully!',
      job
    });
  } catch (error) {
    console.error('Job posting error:', error);
    return res.status(500).json({
      message: 'Failed to post job.'
    });
  }
});

// PUT /api/jobs/:id - Edit a job
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!checkApprovedAlumni(req, res)) return;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job ID.' });
    }

    const {
      title, company, location, type, mode,
      experience, description, skills, applicationLink
    } = req.body;

    if (
      !title?.trim() ||
      !company?.trim() ||
      !location?.trim() ||
      !description?.trim() ||
      !skills?.trim()
    ) {
      return res.status(400).json({
        message: 'Please provide all required job details.'
      });
    }

    // Only the person who posted this job can edit it
    const updatedJob = await Job.findOneAndUpdate(
      {
        _id: id,
        postedBy: req.user._id
      },
      {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        mode,
        experience,
        description: description.trim(),
        skills: skills.trim(),
        applicationLink: applicationLink?.trim() || ''
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: 'Job not found or you are not allowed to edit it.'
      });
    }

    return res.status(200).json({
      message: 'Job updated successfully!',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({
      message: 'Failed to update job.'
    });
  }
});

// DELETE /api/jobs/:id - Delete a job
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!checkApprovedAlumni(req, res)) return;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job ID.' });
    }

    // Only the person who posted this job can delete it
    const deletedJob = await Job.findOneAndDelete({
      _id: id,
      postedBy: req.user._id
    });

    if (!deletedJob) {
      return res.status(404).json({
        message: 'Job not found or you are not allowed to delete it.'
      });
    }

    return res.status(200).json({
      message: 'Job deleted successfully!'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({
      message: 'Failed to delete job.'
    });
  }
});

module.exports = router;
