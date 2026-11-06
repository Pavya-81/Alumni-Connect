
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [processingId, setProcessingId] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please log in with your Admin account.')
      }

      const response = await fetch('/api/admin/pending', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const responseText = await response.text()
      let result = {}

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error('The server returned an invalid response.')
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Unable to load applications (HTTP ${response.status}).`
        )
      }

      setUsers(result.users || [])
    } catch (err) {
      setError(err.message || 'Unable to load applications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingUsers()
  }, [fetchPendingUsers, refreshCount])

  const handleDecision = async (user, action) => {
    let reason = ''

    if (action === 'reject') {
      reason = window.prompt(
        `Enter a rejection reason for ${user.fullName}:`
      )

      if (reason === null) return

      reason = reason.trim()

      if (!reason) {
        setError('Please enter a rejection reason.')
        return
      }
    }

    setProcessingId(user._id)
    setError('')
    setMessage('')

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please log in with your Admin account.')
      }

      const response = await fetch(
        `/api/admin/${user._id}/${action}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          ...(action === 'reject'
            ? { body: JSON.stringify({ reason }) }
            : {})
        }
      )

      const responseText = await response.text()
      let result = {}

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error('The server returned an invalid response.')
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Unable to ${action} application.`
        )
      }

      setUsers((currentUsers) =>
        currentUsers.filter((item) => item._id !== user._id)
      )

      setMessage(
        result.message ||
          (action === 'approve'
            ? 'Application approved successfully.'
            : 'Application rejected successfully.')
      )
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setProcessingId('')
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold">Admin Dashboard</h2>
          <p className="text-secondary mb-0">
            Review Student and Alumni verification applications.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setRefreshCount((count) => count + 1)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>

          <Link to="/" className="btn btn-outline-primary">
            Home
          </Link>
        </div>
      </div>

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && <p>Loading applications...</p>}

      {!loading && !error && users.length === 0 && (
        <div className="alert alert-info">
          No pending applications found.
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th style={{ minWidth: '190px' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.department || '—'}</td>
                  <td>
                    <span className="badge text-bg-warning">
                      {user.verificationStatus}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleDecision(user, 'approve')}
                        disabled={processingId !== ''}
                      >
                        {processingId === user._id
                          ? 'Processing...'
                          : 'Approve'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDecision(user, 'reject')}
                        disabled={processingId !== ''}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
