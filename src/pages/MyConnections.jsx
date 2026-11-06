import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function MyConnections() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [unreadBySender, setUnreadBySender] = useState({})

  const token = localStorage.getItem('token')

  let currentUser = {}

  try {
    currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    currentUser = {}
  }

  const currentUserId = currentUser.id || currentUser._id

  // Fetch connections
  const fetchConnections = async () => {
    try {
      setError('')

      const response = await fetch('/api/connections', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch connections.')
      }

      setConnections(data.connections || [])

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch unread messages
  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/messages/unread-notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      console.log('UNREAD API RESPONSE:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch unread messages.')
      }

      const unreadMap = {}

      if (Array.isArray(data.notifications)) {
        data.notifications.forEach((notification) => {
          if (!notification.sender || !notification.sender._id) return

          const senderId = String(notification.sender._id)

          unreadMap[senderId] = notification.unreadCount

          console.log(
            'MESSAGE FROM:',
            notification.sender.fullName,
            'ID:',
            senderId,
            'UNREAD:',
            notification.unreadCount
          )
        })
      }

      setUnreadBySender(unreadMap)

    } catch (err) {
      console.error('Unread notification error:', err)
    }
  }

  // Load connections and unread messages
  useEffect(() => {
    fetchConnections()
    fetchUnreadNotifications()

    const interval = setInterval(() => {
      fetchUnreadNotifications()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Disconnect
  const disconnect = async (connectionId) => {
    if (!window.confirm('Are you sure you want to disconnect?')) {
      return
    }

    try {
      setError('')
      setMessage('')

      const response = await fetch(
        `/api/connections/${connectionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to disconnect.')
      }

      setMessage('Connection removed successfully!')
      await fetchConnections()

    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading your connections...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">

      <h2 className="fw-bold">My Connections</h2>

      <p className="text-secondary mb-4">
        People you have successfully connected with.
      </p>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {connections.length === 0 ? (
        <div className="text-center py-5">
          <h5>No connections yet</h5>

          <p className="text-secondary">
            Explore Alumni and start building your network!
          </p>

          <Link to="/alumni" className="btn btn-primary mt-2">
            Explore Alumni
          </Link>
        </div>
      ) : (

        <div className="row g-4">

          {connections.map((connection) => {

            const sender = connection.sender
            const receiver = connection.receiver

            const otherUser =
              String(sender?._id) === String(currentUserId)
                ? receiver
                : sender

            if (!otherUser) return null

            const otherUserId = String(otherUser._id)

            const unreadCount = unreadBySender[otherUserId] || 0

            // Debug connection and unread IDs
            console.log('CONNECTION PERSON:', otherUser.fullName)
            console.log('CONNECTION ID:', otherUserId)
            console.log('UNREAD COUNT:', unreadCount)
            console.log('UNREAD MAP:', unreadBySender)

            return (
              <div
                className="col-md-6 col-lg-4"
                key={connection._id}
              >

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center">

                    {/* Profile Photo */}
                    {otherUser.profilePhoto ? (
                      <img
                        src={otherUser.profilePhoto}
                        alt={otherUser.fullName}
                        className="rounded-circle mb-3"
                        style={{
                          width: '85px',
                          height: '85px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{
                          width: '85px',
                          height: '85px',
                          fontSize: '32px',
                          fontWeight: 'bold'
                        }}
                      >
                        {(otherUser.fullName || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    {/* User Information */}
                    <h5 className="fw-bold">
                      {otherUser.fullName}
                    </h5>

                    <p className="text-secondary mb-1">
                      {otherUser.role}
                    </p>

                    {otherUser.company && (
                      <p className="text-secondary">
                        {otherUser.company}
                      </p>
                    )}

                    <span className="badge bg-success mb-3">
                      Connected
                    </span>

                    {/* Unread Message Tag */}
                    {unreadCount > 0 && (
                      <div className="mb-3">
                        <span className="badge bg-danger rounded-pill px-3 py-2">
                          <i className="bi bi-chat-left-text-fill me-1"></i>
                          {unreadCount} Unread
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex flex-wrap justify-content-center gap-2">

                      <Link
                        to={`/alumni/${otherUser._id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        View Profile
                      </Link>

                      <Link
                        to={`/chat/${otherUser._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        <i className="bi bi-chat-dots me-1"></i>
                        Message
                      </Link>

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => disconnect(connection._id)}
                      >
                        Disconnect
                      </button>

                    </div>

                  </div>
                </div>
              </div>
            )
          })}

        </div>
      )}

    </div>
  )
}

export default MyConnections