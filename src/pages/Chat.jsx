
import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

function Chat() {
  const { userId } = useParams()

  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  )

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load messages.')
      }

      setMessages(data.messages || [])
setOtherUser(data.otherUser || null)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, token])

  // Load chat history and refresh every 3 seconds
  useEffect(() => {
    fetchMessages()

    const interval = setInterval(fetchMessages, 3000)

    return () => clearInterval(interval)
  }, [fetchMessages])

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    try {
      setSending(true)
      setError('')

      const response = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send message.')
      }

      setNewMessage('')
      await fetchMessages()

    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading chat...</p>
      </div>
    )
  }

  const getOtherUserName = () => {
    if (messages.length === 0) return 'Chat'

    const firstMessage = messages[0]

    return String(firstMessage.sender) === String(currentUser.id || currentUser._id)
      ? 'Alumni / Student'
      : 'Alumni / Student'
  }

  return (
    <div className="container py-4">

      <div className="card shadow-sm border-0">

        {/* Chat Header */}
        <div className="card-header bg-primary text-white p-3">
          <Link
            to="/my-connections"
            className="text-white text-decoration-none"
          >
            ← Back to My Connections
          </Link>

          <h5 className="mb-0 mt-2">
            {otherUser?.fullName || getOtherUserName()}
          </h5>
        </div>

        {/* Messages */}
        <div
          className="card-body"
          style={{
            height: '450px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}
        >

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {messages.length === 0 && !error && (
            <div className="text-center text-secondary mt-5">
              <h5>No messages yet</h5>
              <p>Start your conversation!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMine =
              String(msg.sender) === String(currentUser.id || currentUser._id)

            return (
              <div
                key={msg._id}
                className={`d-flex mb-3 ${
                  isMine ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: '15px',
                    backgroundColor: isMine ? '#0d6efd' : '#ffffff',
                    color: isMine ? '#ffffff' : '#333333',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                  }}
                >
                  <p className="mb-1">{msg.message}</p>

                  <small style={{ opacity: 0.75 }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
            )
          })}

        </div>

        {/* Message Input */}
        <div className="card-footer bg-white p-3">

          <form onSubmit={handleSend} className="d-flex gap-2">

            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={2000}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Chat
