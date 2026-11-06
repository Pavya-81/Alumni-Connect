
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function MyProfile() {
  const token = localStorage.getItem('token')

  const [formData, setFormData] = useState({
    currentPosition: '',
    company: '',
    department: '',
    graduationYear: '',
    skills: '',
    bio: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState(null)

  // Fetch logged-in Alumni profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch profile')
        }

        if (
          data.user.role !== 'Alumni' ||
          data.user.verificationStatus !== 'Approved'
        ) {
          throw new Error('Only approved Alumni can edit their profile.')
        }

        const user = data.user
        setProfile(user)

        setFormData({
          currentPosition: user.currentPosition || '',
          company: user.company || '',
          department: user.department || '',
          graduationYear: user.graduationYear || '',
          skills: (user.skills || []).join(', '),
          bio: user.bio || ''
        })

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchProfile()
    } else {
      setError('Please log in to view your profile.')
      setLoading(false)
    }
  }, [token])

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Update profile
  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updatedData = {
        ...formData,
        graduationYear: Number(formData.graduationYear),
        skills: formData.skills
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean)
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed.')
      }

      setProfile(data.user)

      setFormData(prev => ({
        ...prev,
        skills: (data.user.skills || []).join(', ')
      }))

      setSuccess('Your profile has been updated successfully!')

    } catch (err) {
      console.error('Profile update error:', err)
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Loading your profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container text-center py-5">
        <h4>Unable to load profile</h4>
        <p className="text-danger">{error}</p>
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container py-5">

        <div className="mb-4">
          <span className="badge bg-primary-subtle text-primary px-3 py-2">
            ALUMNI COMMUNITY
          </span>

          <h2 className="fw-bold mt-3">
            My Profile
          </h2>

          <p className="text-secondary">
            Manage your professional information and let students
            discover your experience.
          </p>
        </div>

        <div className="card border-0 shadow-sm p-4">

          {/* Profile Header */}
          <div className="d-flex align-items-center gap-3 mb-4">

            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '75px',
                height: '75px',
                backgroundColor: '#EAF2FF',
                color: '#2563EB',
                fontSize: '30px',
                fontWeight: '700'
              }}
            >
              {profile.fullName?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h4 className="fw-bold mb-1">
                {profile.fullName}
              </h4>

              <p className="text-secondary mb-0">
                {profile.email}
              </p>

              <span className="badge bg-success-subtle text-success mt-1">
                Approved Alumni
              </span>
            </div>

          </div>

          <hr />

          <h5 className="fw-bold mb-3">
            Professional Information
          </h5>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              {/* Current Position */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Current Position
                </label>

                <input
                  type="text"
                  name="currentPosition"
                  className="form-control form-control-lg"
                  placeholder="Software Engineer"
                  value={formData.currentPosition}
                  onChange={handleChange}
                />
              </div>

              {/* Company */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Current Company
                </label>

                <input
                  type="text"
                  name="company"
                  className="form-control form-control-lg"
                  placeholder="Enter your company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              {/* Department */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  className="form-control form-control-lg"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              {/* Graduation Year */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Graduation Year
                </label>

                <input
                  type="number"
                  name="graduationYear"
                  className="form-control form-control-lg"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Skills */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Skills
                </label>

                <input
                  type="text"
                  name="skills"
                  className="form-control form-control-lg"
                  placeholder="React, Node.js, MongoDB, Java"
                  value={formData.skills}
                  onChange={handleChange}
                />

                <small className="text-secondary">
                  Separate each skill using a comma.
                </small>
              </div>

              {/* Bio */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  About Me
                </label>

                <textarea
                  name="bio"
                  rows="5"
                  className="form-control"
                  placeholder="Write something about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="d-flex flex-wrap gap-3 mt-4">

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <Link
                to="/alumni"
                className="btn btn-outline-secondary btn-lg"
              >
                Explore Alumni
              </Link>

            </div>

          </form>

        </div>

      </div>
    </div>
  )
}

export default MyProfile
