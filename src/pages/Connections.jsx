
import { useEffect, useState } from 'react'

function Connections() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/connections/received', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch requests.')
      }

      setRequests(data.requests || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const respondToRequest = async (requestId, status) => {
    try {
      setMessage('')
      setError('')

      const response = await fetch(
        `/api/connections/${requestId}/respond`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update request.')
      }

      setMessage(data.message || `Request ${status.toLowerCase()} successfully!`)

      // Refresh requests
      await fetchRequests()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading connection requests...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">

      <h2 className="fw-bold mb-2">Connection Requests</h2>

      <p className="text-secondary mb-4">
        Manage the connection requests you have received.
      </p>

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-5">
          <h5>No pending requests</h5>
          <p className="text-secondary">
            You will see new connection requests here.
          </p>
        </div>
      ) : (
        <div className="row g-4">

          {requests.map((request) => {
            const sender = request.sender

            return (
              <div className="col-md-6 col-lg-4" key={request._id}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">

                    <h5 className="fw-bold">
                      {sender?.fullName || 'Unknown User'}
                    </h5>

                    <p className="text-secondary mb-1">
                      {sender?.email || ''}
                    </p>

                    <p className="text-secondary">
                      {sender?.role || ''}
                    </p>

                    <span className="badge bg-warning text-dark mb-3">
                      Pending
                    </span>

                    <div className="d-flex gap-2">

                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          respondToRequest(request._id, 'Accepted')
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          respondToRequest(request._id, 'Rejected')
                        }
                      >
                        Reject
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

export default Connections
