
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  const [role, setRole] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    currentYear: '',
    graduationYear: '',
    company: '',
    password: '',
    confirmPassword: '',
    studentIdDocument: null,
    alumniDocument: null
  })

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: files?.[0] || null
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setMessageType('info')

    if (!role) {
      setMessage('Please select Student or Alumni.')
      setMessageType('danger')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.')
      setMessageType('danger')
      return
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters.')
      setMessageType('danger')
      return
    }

    if (
      role === 'Student' &&
      (!formData.department ||
        !formData.currentYear ||
        !formData.studentIdDocument)
    ) {
      setMessage('Please complete your student details and upload your ID card.')
      setMessageType('danger')
      return
    }

    if (
      role === 'Alumni' &&
      (!formData.department ||
        !formData.graduationYear ||
        !formData.alumniDocument)
    ) {
      setMessage('Please complete your alumni details and upload your alumni card.')
      setMessageType('danger')
      return
    }

    setLoading(true)

    try {
      const data = new FormData()

      data.append('fullName', formData.fullName.trim())
      data.append('email', formData.email.trim())
      data.append('password', formData.password)
      data.append('confirmPassword', formData.confirmPassword)
      data.append('role', role)
      data.append('department', formData.department.trim())

      if (role === 'Student') {
        data.append('currentYear', formData.currentYear)
        data.append('studentIdDocument', formData.studentIdDocument)
      }

      if (role === 'Alumni') {
        data.append('graduationYear', formData.graduationYear)
        data.append('company', formData.company.trim())
        data.append('alumniDocument', formData.alumniDocument)
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: data
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.')
      }

      setMessage(
        result.message ||
          'Registration successful! Your account is pending admin verification.'
      )
      setMessageType('success')

      // Navigate only after the backend confirms registration.
      setTimeout(() => {
        navigate('/login', {
          state: {
            registrationMessage:
              result.message ||
              'Registration successful! Please wait for admin verification.'
          }
        })
      }, 1500)
    } catch (error) {
      console.error('Registration error:', error)

      setMessage(
        error.message === 'Failed to fetch'
          ? 'Could not connect to the backend. Please check the server and proxy.'
          : error.message || 'Registration failed. Please try again.'
      )

      setMessageType('danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="text-center mb-4">
          <div className="auth-logo">AC</div>

          <h2 className="fw-bold mt-3">
            Create Your Account
          </h2>

          <p className="text-secondary">
            Join the Alumni Connect community
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              I am a
            </label>

            <select
              className="form-select form-select-lg"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                setMessage('')
              }}
              required
            >
              <option value="">Select your role</option>
              <option value="Student">Student</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          {role === 'Student' && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-control form-control-lg"
                  placeholder="Enter your department"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Current Year
                </label>

                <select
                  name="currentYear"
                  value={formData.currentYear}
                  onChange={handleChange}
                  className="form-select form-select-lg"
                  required
                >
                  <option value="">Select your year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Student ID Card
                </label>

                <input
                  type="file"
                  name="studentIdDocument"
                  className="form-control form-control-lg"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />

                <small className="text-secondary">
                  Upload your valid student ID card.
                </small>
              </div>
            </>
          )}

          {role === 'Alumni' && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Graduation Year
                </label>

                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="form-control form-control-lg"
                  placeholder="Example: 2024"
                  min="1950"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-control form-control-lg"
                  placeholder="Enter your department"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Current Company
                </label>

                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-control form-control-lg"
                  placeholder="Enter your company"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Alumni Card
                </label>

                <input
                  type="file"
                  name="alumniDocument"
                  className="form-control form-control-lg"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />

                <small className="text-secondary">
                  Upload your valid alumni card.
                </small>
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-control form-control-lg"
              placeholder="Confirm your password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={!role || loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {message && (
          <div
            className={`alert alert-${messageType} mt-3`}
            role="alert"
          >
            {message}
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-secondary mb-1">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="text-primary fw-semibold text-decoration-none"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
