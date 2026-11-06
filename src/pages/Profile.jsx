
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function Profile() {
  const { id } = useParams()

  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentUser, setCurrentUser] = useState(null)
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectMessage, setConnectMessage] = useState('')
  const [connectError, setConnectError] = useState(false)

  const [connectionStatus, setConnectionStatus] = useState('checking')

  // Get logged-in user
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error('Unable to read user:', err)
    }
  }, [])

  // Fetch Student or Alumni profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError('')
        setPerson(null)

        const response = await fetch(`/api/alumni/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch profile.')
        }

        setPerson(data.person)

      } catch (err) {
        console.error('Profile fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfile()
    }
  }, [id])

  // Check whether already connected
  useEffect(() => {
    const checkConnection = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setConnectionStatus('none')
        return
      }

      try {
        setConnectionStatus('checking')

        const response = await fetch('/api/connections', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to check connections.')
        }

        const connections = data.connections || []

        const alreadyConnected = connections.some((connection) => {
          const senderId = String(connection.sender?._id)
          const receiverId = String(connection.receiver?._id)
          const profileId = String(id)

          return senderId === profileId || receiverId === profileId
        })

        setConnectionStatus(
          alreadyConnected ? 'connected' : 'none'
        )

      } catch (err) {
        console.error('Connection status error:', err)
        setConnectionStatus('none')
      }
    }

    if (id) {
      checkConnection()
    }
  }, [id, currentUser])

  // Send connection request
  const handleConnect = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setConnectError(true)
      setConnectMessage('Please login to send a connection request.')
      return
    }

    if (!currentUser) {
      setConnectError(true)
      setConnectMessage('Unable to identify your account. Please login again.')
      return
    }

    const currentUserId = currentUser.id || currentUser._id

    if (String(currentUserId) === String(id)) {
      setConnectError(true)
      setConnectMessage('You cannot connect with yourself.')
      return
    }

    try {
      setConnectLoading(true)
      setConnectMessage('')
      setConnectError(false)

      const response = await fetch(`/api/connections/send/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send connection request.')
      }

      setConnectMessage(
        data.message || 'Connection request sent successfully!'
      )

      setConnectionStatus('pending')

    } catch (err) {
      console.error('Connection error:', err)
      setConnectError(true)
      setConnectMessage(err.message || 'Something went wrong.')
    } finally {
      setConnectLoading(false)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">
          Loading profile...
        </p>
      </div>
    )
  }

  // Profile not found
  if (error || !person) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold">Profile not found</h3>

        <p className="text-secondary">
          {error || 'This profile may not exist or may not be approved.'}
        </p>

        <Link to="/alumni" className="btn btn-primary mt-3">
          Back to Alumni
        </Link>
      </div>
    )
  }

  const currentUserId = currentUser?.id || currentUser?._id

  const isOwnProfile =
    currentUserId &&
    String(currentUserId) === String(id)

  const isAlumni = person.role === 'Alumni'
  const isStudent = person.role === 'Student'

  const canConnect =
    !isOwnProfile &&
    isAlumni &&
    ['Student', 'Alumni'].includes(currentUser?.role)

  return (
    <div className="profile-page">
      <div className="container py-5">

        <Link
          to="/alumni"
          className="text-decoration-none fw-semibold"
        >
          ← Back to Alumni
        </Link>

        <div className="profile-card mt-4">

          <div className="profile-banner"></div>

          <div className="profile-content">

            {/* Profile Photo */}
            {person.profilePhoto ? (
              <img
                src={person.profilePhoto}
                alt={person.fullName}
                className="profile-avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="profile-avatar">
                {(person.fullName || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Basic Information */}
            <h2 className="fw-bold mt-3">
              {person.fullName}
            </h2>

            <span className={`badge ${
              isAlumni ? 'bg-primary' : 'bg-secondary'
            }`}>
              {person.role}
            </span>

            {/* Alumni Information */}
            {isAlumni && (
              <>
                <h5 className="text-primary mt-3">
                  {person.currentPosition || 'Position not provided'}
                </h5>

                <p className="text-secondary mb-1">
                  {person.company || 'Company not provided'}
                </p>

                <p className="text-secondary">
                  Batch of {person.graduationYear || 'Not provided'}
                </p>
              </>
            )}

            {/* Student Information */}
            {isStudent && (
              <div className="mt-3">
                <h5 className="text-primary">Student</h5>

                <p className="text-secondary">
                  {person.currentYear || 'Academic year not provided'}
                </p>
              </div>
            )}

            <hr />

            {/* About */}
            <h5 className="fw-bold">About</h5>

            <p className="text-secondary">
              {person.bio || 'No bio added yet.'}
            </p>

            {/* Academic Information */}
            <div className="row g-4 mt-2">

              <div className="col-md-6">
                <h6 className="fw-bold">Department</h6>

                <p className="text-secondary">
                  {person.department || 'Not provided'}
                </p>
              </div>

              {isAlumni && (
                <div className="col-md-6">
                  <h6 className="fw-bold">Graduation Year</h6>

                  <p className="text-secondary">
                    {person.graduationYear || 'Not provided'}
                  </p>
                </div>
              )}

              {isStudent && (
                <div className="col-md-6">
                  <h6 className="fw-bold">Current Academic Year</h6>

                  <p className="text-secondary">
                    {person.currentYear || 'Not provided'}
                  </p>
                </div>
              )}

            </div>

            <hr />

            {/* Skills */}
            <h5 className="fw-bold mb-3">Skills</h5>

            <div className="d-flex flex-wrap gap-2">
              {person.skills?.length > 0 ? (
                person.skills.map((skill, index) => (
                  <span
                    className="badge bg-light text-primary border p-2"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-secondary">
                  No skills added yet.
                </p>
              )}
            </div>

            {/* Connection Status */}
            {canConnect && (
              <div className="mt-4">

                {connectionStatus === 'checking' && (
                  <button className="btn btn-secondary" disabled>
                    Checking connection...
                  </button>
                )}

                {connectionStatus === 'connected' && (
                  <span className="badge bg-success p-2">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Connected
                  </span>
                )}

                {connectionStatus === 'pending' && (
                  <button className="btn btn-secondary" disabled>
                    Request Sent
                  </button>
                )}

                {connectionStatus === 'none' && (
                  <button
                    className="btn btn-primary"
                    onClick={handleConnect}
                    disabled={connectLoading}
                  >
                    {connectLoading
                      ? 'Sending...'
                      : 'Connect with Alumni'}
                  </button>
                )}

              </div>
            )}

            {/* Connection Message */}
            {connectMessage && (
              <div
                className={`alert mt-3 ${
                  connectError ? 'alert-danger' : 'alert-success'
                }`}
                role="alert"
              >
                {connectMessage}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
