
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function PostJob() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    mode: 'On-site',
    experience: 'Fresher',
    description: '',
    skills: '',
    applicationLink: ''
  })

  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    const token = localStorage.getItem('token')

    if (!token) {
      setIsError(true)
      setMessage('Please log in before posting a job.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const text = await response.text()
      let result = {}

      try {
        result = text ? JSON.parse(text) : {}
      } catch {
        result = {}
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Request failed (${response.status})`
        )
      }

      setIsError(false)
      setMessage(result.message || 'Job posted successfully!')

      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        mode: 'On-site',
        experience: 'Fresher',
        description: '',
        skills: '',
        applicationLink: ''
      })
    } catch (error) {
      setIsError(true)
      setMessage(error.message || 'Unable to post job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="post-job-page">
      <div className="container py-5">
        <Link to="/jobs" className="text-decoration-none">
          ← Back to Jobs
        </Link>

        <div className="post-job-card mt-4">
          <div className="mb-4">
            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              ALUMNI CAREER NETWORK
            </span>

            <h1 className="fw-bold mt-3">Post a Job</h1>

            <p className="text-secondary">
              Share an opportunity with students and fellow alumni.
            </p>
          </div>

          {message && (
            <div
              className={`alert ${
                isError ? 'alert-danger' : 'alert-success'
              }`}
              role="alert"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Job Title *
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Frontend Developer"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Company *
                </label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Location *
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Chennai or Remote"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Job Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Work Mode
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Experience
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option>Fresher</option>
                  <option>Student</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>5+ years</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Required Skills *
                </label>
                <input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="React, Node.js, MongoDB"
                  required
                />
                <small className="text-secondary">
                  Separate skills with commas.
                </small>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="5"
                  placeholder="Describe the role, responsibilities and requirements..."
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Application URL (optional)
                </label>
                <input
                  type="url"
                  name="applicationLink"
                  value={formData.applicationLink}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="https://company.com/careers"
                />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3 mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Submit Job'}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/jobs')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostJob
