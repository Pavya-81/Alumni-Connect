
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [myJobs, setMyJobs] = useState([])

  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')
  const [location, setLocation] = useState('')

  const [activeTab, setActiveTab] = useState('all')

  const [loading, setLoading] = useState(true)
  const [myJobsLoading, setMyJobsLoading] = useState(false)
  const [error, setError] = useState('')

  // Edit job states
  const [editingJob, setEditingJob] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Get logged-in user
  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user = null
  }

  const isApprovedAlumni =
    !!localStorage.getItem('token') &&
    user?.role === 'Alumni' &&
    user?.verificationStatus === 'Approved'

  const token = localStorage.getItem('token')

  // Format jobs received from MongoDB
  function formatJobs(jobList) {
    return (jobList || []).map((job) => ({
      ...job,
      skills: Array.isArray(job.skills)
        ? job.skills
        : (job.skills || '')
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean)
    }))
  }

  // Fetch all jobs
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)

        const response = await fetch('/api/jobs')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch jobs')
        }

        setJobs(formatJobs(data.jobs))
      } catch (err) {
        console.error('Fetch jobs error:', err)
        setError(err.message || 'Failed to load jobs.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Fetch jobs posted by current Alumni
  async function fetchMyJobs() {
    if (!token) {
      setError('Please log in again.')
      return
    }

    try {
      setMyJobsLoading(true)
      setError('')

      const response = await fetch('/api/jobs/my-jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch your jobs')
      }

      setMyJobs(formatJobs(data.jobs))
    } catch (err) {
      console.error('My jobs error:', err)
      setError(err.message || 'Failed to fetch your jobs.')
    } finally {
      setMyJobsLoading(false)
    }
  }

  // Open edit form
  function handleEdit(job) {
    setEditingJob(job)

    setEditForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      mode: job.mode || 'On-site',
      experience: job.experience || 'Fresher',
      description: job.description || '',
      skills: Array.isArray(job.skills)
        ? job.skills.join(', ')
        : job.skills || '',
      applicationLink: job.applicationLink || ''
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle edit form inputs
  function handleEditChange(e) {
    const { name, value } = e.target

    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Update job
  async function handleUpdate(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const response = await fetch(
        `/api/jobs/${editingJob._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(editForm)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update job')
      }

      alert('Job updated successfully!')

      setEditingJob(null)
      setEditForm({})

      // Refresh My Posted Jobs
      await fetchMyJobs()

      // Update All Jobs list
      setJobs((prev) =>
        prev.map((job) =>
          job._id === editingJob._id
            ? formatJobs([data.job])[0]
            : job
        )
      )

    } catch (err) {
      console.error('Update job error:', err)
      setError(err.message || 'Failed to update job.')
    } finally {
      setSaving(false)
    }
  }

  // Delete job
  async function handleDelete(jobId) {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this job?'
    )

    if (!confirmDelete) return

    try {
      setDeletingId(jobId)
      setError('')

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete job')
      }

      alert('Job deleted successfully!')

      setMyJobs((prev) =>
        prev.filter((job) => job._id !== jobId)
      )

      setJobs((prev) =>
        prev.filter((job) => job._id !== jobId)
      )

    } catch (err) {
      console.error('Delete job error:', err)
      setError(err.message || 'Failed to delete job.')
    } finally {
      setDeletingId(null)
    }
  }

  // Search and filter
  const currentJobs = activeTab === 'my' ? myJobs : jobs

  const filteredJobs = currentJobs.filter((job) => {
    const query = search.toLowerCase()

    const matchesSearch =
      (job.title || '').toLowerCase().includes(query) ||
      (job.company || '').toLowerCase().includes(query) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(query)
      )

    const matchesType =
      jobType === '' || job.type === jobType

    const matchesLocation =
      location === '' ||
      (job.location || '')
        .toLowerCase()
        .includes(location.toLowerCase())

    return matchesSearch && matchesType && matchesLocation
  })

  // Switch tabs
  function handleTabChange(tab) {
    setActiveTab(tab)
    setSearch('')
    setJobType('')
    setLocation('')
    setError('')
    setEditingJob(null)

    if (tab === 'my') {
      fetchMyJobs()
    }
  }

  return (
    <div className="jobs-page">

      {/* Header */}
      <section className="jobs-header">
        <div className="container text-center">

          <span className="badge bg-primary-subtle text-primary px-3 py-2">
            CAREER OPPORTUNITIES
          </span>

          <h1 className="display-5 fw-bold mt-3">
            Find Your Next Opportunity
          </h1>

          <p className="lead text-secondary">
            Discover jobs and internships to take your career forward.
          </p>

        </div>
      </section>

      {/* Edit Job Form */}
      {editingJob && (
        <section className="container py-4">
          <div className="card shadow-sm border-0 p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Edit Job</h4>

              <button
                className="btn btn-outline-secondary"
                onClick={() => setEditingJob(null)}
                type="button"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label">Job Title *</label>
                  <input
                    className="form-control"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Company *</label>
                  <input
                    className="form-control"
                    name="company"
                    value={editForm.company}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Location *</label>
                  <input
                    className="form-control"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Work Mode</label>
                  <select
                    className="form-select"
                    name="mode"
                    value={editForm.mode}
                    onChange={handleEditChange}
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Experience</label>
                  <input
                    className="form-control"
                    name="experience"
                    value={editForm.experience}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Skills (comma separated) *
                  </label>
                  <input
                    className="form-control"
                    name="skills"
                    value={editForm.skills}
                    onChange={handleEditChange}
                    placeholder="React, JavaScript, Node.js"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Application Link</label>
                  <input
                    className="form-control"
                    type="url"
                    name="applicationLink"
                    value={editForm.applicationLink}
                    onChange={handleEditChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="col-12 d-flex gap-2 mt-4">

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditingJob(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            </form>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="container py-4">
        <div className="jobs-search-card">
          <div className="row g-3">

            <div className="col-lg-5">
              <label className="form-label fw-semibold">
                Search Jobs
              </label>

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Job title, company or skill"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-lg-3">
              <label className="form-label fw-semibold">
                Job Type
              </label>

              <select
                className="form-select form-select-lg"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="col-lg-4">
              <label className="form-label fw-semibold">
                Location
              </label>

              <select
                className="form-select form-select-lg"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Coimbatore">Coimbatore</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="container pb-5">

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

          <div>
            <h4 className="fw-bold mb-1">
              {activeTab === 'all'
                ? 'Available Opportunities'
                : 'My Posted Jobs'}
            </h4>

            <p className="text-secondary mb-0">
              {filteredJobs.length} opportunities found
            </p>
          </div>

          {isApprovedAlumni && (
            <Link to="/post-job" className="btn btn-primary">
              + Post a Job
            </Link>
          )}

        </div>

        {/* Tabs */}
        {isApprovedAlumni && (
          <div className="d-flex flex-wrap gap-2 mb-4">

            <button
              className={`btn ${
                activeTab === 'all'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => handleTabChange('all')}
            >
              All Jobs
            </button>

            <button
              className={`btn ${
                activeTab === 'my'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              onClick={() => handleTabChange('my')}
            >
              My Posted Jobs
            </button>

          </div>
        )}

        {/* Loading */}
        {(loading && activeTab === 'all') ||
        (myJobsLoading && activeTab === 'my') ? (

          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>

            <p className="text-secondary mt-3">
              Loading jobs...
            </p>
          </div>

        ) : (

          <>
            {/* Error */}
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {/* Job Cards */}
            {!error && (
              <div className="row g-4">

                {filteredJobs.map((job) => (

                  <div className="col-md-6" key={job._id}>

                    <div className="job-card h-100">

                      <div className="d-flex align-items-start gap-3 mb-3">

                        <div className="company-avatar">
                          {(job.company || 'C')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h5 className="fw-bold mb-1">
                            {job.title}
                          </h5>

                          <p className="text-primary mb-1">
                            {job.company}
                          </p>

                          <small className="text-secondary">
                            {job.location}
                          </small>
                        </div>

                      </div>

                      {/* Job Details */}
                      <div className="d-flex flex-wrap gap-2 mb-3">

                        <span className="badge bg-light text-dark border">
                          {job.type || 'Full-time'}
                        </span>

                        <span className="badge bg-light text-dark border">
                          {job.mode || 'On-site'}
                        </span>

                        <span className="badge bg-light text-dark border">
                          {job.experience || 'Fresher'}
                        </span>

                      </div>

                      {/* Description */}
                      <p className="text-secondary">
                        {job.description}
                      </p>

                      {/* Skills */}
                      <div className="d-flex flex-wrap gap-2 mb-4">

                        {job.skills.map((skill, index) => (
                          <span
                            className="badge bg-primary-subtle text-primary"
                            key={`${job._id}-${index}`}
                          >
                            {skill}
                          </span>
                        ))}

                      </div>

                      {/* Application Link */}
                      {job.applicationLink && (
                        <a
                          href={job.applicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary w-100 mb-3"
                        >
                          Apply Now
                        </a>
                      )}

                      {/* Edit and Delete - Only My Posted Jobs */}
                      {activeTab === 'my' && isApprovedAlumni && (
                        <div className="d-flex gap-2 mt-3">

                          <button
                            className="btn flex-fill"
                            style={{
                              backgroundColor: '#EAF2FF',
                              color: '#2563EB',
                              border: '1px solid #D6E5FF',
                              borderRadius: '10px',
                              fontWeight: '600',
                              padding: '10px'
                            }}
                            onClick={() => handleEdit(job)}
                          >
                            <i className="bi bi-pencil-square me-2"></i>
                            Edit
                          </button>

                          <button
                            className="btn flex-fill"
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#475569',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              fontWeight: '600',
                              padding: '10px'
                            }}
                            onClick={() => handleDelete(job._id)}
                            disabled={deletingId === job._id}
                          >
                            <i className="bi bi-trash me-2"></i>
                            {deletingId === job._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>

                        </div>
                      )}

                    </div>
                  </div>
                ))}

                {/* No Jobs */}
                {filteredJobs.length === 0 && (
                  <div className="text-center py-5">
                    <h5 className="fw-bold">
                      {activeTab === 'my'
                        ? 'You have not posted any jobs yet.'
                        : 'No jobs found'}
                    </h5>

                    <p className="text-secondary">
                      {activeTab === 'my'
                        ? 'Post your first job opportunity!'
                        : 'Try a different search or filter.'}
                    </p>
                  </div>
                )}

              </div>
            )}
          </>

        )}

      </section>

    </div>
  )
}

export default Jobs
