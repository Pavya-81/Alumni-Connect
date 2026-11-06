
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      // Read the response body only once
      const responseText = await response.text()
      let result = {}

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(
          `Invalid server response (HTTP ${response.status}).`
        )
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Login failed (HTTP ${response.status}).`
        )
      }

      if (!result.token || !result.user) {
        throw new Error(
          'Login token or user details are missing.'
        )
      }

      // Save login information
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))

      // Notify Navbar that login status changed
      window.dispatchEvent(new Event('authChange'))

      setMessage('Login successful!')
      setMessageType('success')

      // Redirect according to role
      setTimeout(() => {
        if (result.user.role === 'Admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }, 800)

    } catch (error) {
      setMessage(
        error.message || 'Unable to connect to the server.'
      )
      setMessageType('danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="text-center mb-4">
          <div className="auth-logo">AC</div>

          <h2 className="fw-bold mt-3">
            Welcome Back
          </h2>

          <p className="text-secondary">
            Login to your Alumni Connect account
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Email Address
            </label>

            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Password
            </label>

            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
              />

              <label
                className="form-check-label"
                htmlFor="rememberMe"
              >
                Remember me
              </label>
            </div>

            <span className="text-secondary small">
              Forgot password?
            </span>
          </div>

          {message && (
            <div
              className={`alert alert-${messageType}`}
              role="alert"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-secondary mb-0">
            Don't have an account?
          </p>

          <Link
            to="/register"
            className="text-primary fw-semibold text-decoration-none"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Login
