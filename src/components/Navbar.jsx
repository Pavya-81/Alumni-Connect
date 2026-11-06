
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const navigate = useNavigate()

  // Check login and user role
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token')

      let loggedInUser = null

      try {
        loggedInUser = JSON.parse(
          localStorage.getItem('user') || 'null'
        )
      } catch {
        loggedInUser = null
      }

      setIsLoggedIn(Boolean(token && loggedInUser))
      setUser(token ? loggedInUser : null)
    }

    checkLogin()

    window.addEventListener('storage', checkLogin)
    window.addEventListener('authChange', checkLogin)

    return () => {
      window.removeEventListener('storage', checkLogin)
      window.removeEventListener('authChange', checkLogin)
    }
  }, [])

  // Approved Student
  const isApprovedStudent =
    isLoggedIn &&
    user?.role === 'Student' &&
    user?.verificationStatus === 'Approved'

  // Approved Alumni
  const isApprovedAlumni =
    isLoggedIn &&
    user?.role === 'Alumni' &&
    user?.verificationStatus === 'Approved'

  // Student or Alumni
  const canExplore =
    isApprovedStudent || isApprovedAlumni

  // Admin
  const isAdmin =
    isLoggedIn &&
    user?.role === 'Admin'

  // Fetch unread messages count
  useEffect(() => {
    if (!canExplore) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(
          '/api/messages/unread-count',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (response.ok) {
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Unread count error:', error)
      }
    }

    fetchUnreadCount()

    const interval = setInterval(fetchUnreadCount, 5000)

    return () => clearInterval(interval)
  }, [canExplore])

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setIsLoggedIn(false)
    setUser(null)
    setUnreadCount(0)

    window.dispatchEvent(new Event('authChange'))

    navigate('/login')
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm"
      style={{
        backgroundColor: '#0d6efd'
      }}
    >

      <div className="container">

        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/">
          Alumni Connect
        </Link>

        <div className="navbar-nav ms-auto align-items-center">

          {/* Home */}
          <Link className="nav-link text-white" to="/">
            Home
          </Link>

          {isLoggedIn ? (
            <>

              {/* Approved Students and Alumni */}
              {canExplore && (
                <>
                  <Link
                    className="nav-link text-white"
                    to="/alumni"
                  >
                    Explore Alumni
                  </Link>

                  <Link
                    className="nav-link text-white"
                    to="/jobs"
                  >
                    Jobs
                  </Link>

                  {/* My Connections with unread badge */}
                  <Link
                    className="nav-link text-white d-flex align-items-center gap-2"
                    to="/my-connections"
                  >
                    My Connections

                    {unreadCount > 0 && (
                      <span
                        className="badge rounded-pill bg-danger"
                        style={{
                          fontSize: '11px'
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Approved Alumni Only */}
              {isApprovedAlumni && (
                <>
                  <Link
                    className="nav-link text-white"
                    to="/connections"
                  >
                    Connection Requests
                  </Link>

                  <Link
                    className="nav-link text-white"
                    to="/my-profile"
                  >
                    My Profile
                  </Link>
                </>
              )}

              {/* Admin Only */}
              {isAdmin && (
                <Link
                  className="nav-link text-white"
                  to="/admin"
                >
                  Admin Dashboard
                </Link>
              )}

              {/* Logout */}
              <button
                className="btn ms-2 fw-semibold"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0d6efd',
                  border: '2px solid #ffffff',
                  borderRadius: '8px',
                  padding: '8px 20px'
                }}
                onClick={handleLogout}
              >
                Logout
              </button>

            </>
          ) : (

            /* Logged Out */
            <Link
              className="nav-link text-white"
              to="/login"
            >
              Login
            </Link>

          )}

        </div>

      </div>

    </nav>
  )
}

export default Navbar
