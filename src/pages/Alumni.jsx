
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Alumni() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch approved Alumni from MongoDB
  useEffect(() => {
    async function fetchAlumni() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('/api/alumni')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch alumni')
        }

        setAlumni(data.alumni || [])
      } catch (err) {
        console.error('Fetch alumni error:', err)
        setError(err.message || 'Failed to load alumni.')
      } finally {
        setLoading(false)
      }
    }

    fetchAlumni()
  }, [])

  // Search and department filter
  const filteredAlumni = alumni.filter((person) => {
    const query = search.toLowerCase()

    const matchesSearch =
      (person.fullName || '').toLowerCase().includes(query) ||
      (person.company || '').toLowerCase().includes(query) ||
      (person.currentPosition || '').toLowerCase().includes(query) ||
      (person.skills || []).some((skill) =>
        skill.toLowerCase().includes(query)
      )

    const matchesDepartment =
      department === '' || person.department === department

    return matchesSearch && matchesDepartment
  })

  // Get unique departments from database
  const departments = [
    ...new Set(
      alumni
        .map((person) => person.department)
        .filter(Boolean)
    )
  ]

  return (
    <div className="alumni-page">

      {/* Header */}
      <section className="alumni-header">
        <div className="container">
          <div className="text-center">

            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              ALUMNI COMMUNITY
            </span>

            <h1 className="display-5 fw-bold mt-3">
              Explore Our Alumni
            </h1>

            <p className="lead text-secondary">
              Discover experienced professionals and build meaningful
              connections with your alumni community.
            </p>

          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-4">
        <div className="container">

          <div className="search-card">
            <div className="row g-3">

              <div className="col-lg-8">
                <label className="form-label fw-semibold">
                  Search Alumni
                </label>

                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search by name, company or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-semibold">
                  Department
                </label>

                <select
                  className="form-select form-select-lg"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>

                  {departments.map((dept) => (
                    <option value={dept} key={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Alumni Cards */}
      <section className="pb-5">
        <div className="container">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">
                Alumni Members
              </h4>

              <p className="text-secondary mb-0">
                {filteredAlumni.length} alumni found
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>

              <p className="text-secondary mt-3">
                Loading alumni...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* Alumni Cards */}
          {!loading && !error && (
            <div className="row g-4">

              {filteredAlumni.map((person) => (
                <div
                  className="col-md-6 col-lg-4"
                  key={person._id}
                >

                  <div className="alumni-card h-100">

                    {/* Alumni Information */}
                    <div className="d-flex align-items-center mb-3">

                      {person.profilePhoto ? (
                        <img
                          src={person.profilePhoto}
                          alt={person.fullName}
                          className="alumni-avatar"
                          style={{
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="alumni-avatar">
                          {(person.fullName || 'A')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="ms-3">

                        <h5 className="fw-bold mb-1">
                          {person.fullName}
                        </h5>

                        <small className="text-secondary">
                          Batch of {person.graduationYear || 'Not provided'}
                        </small>

                      </div>
                    </div>

                    {/* Position */}
                    <h6 className="fw-semibold mb-1">
                      {person.currentPosition || 'Position not provided'}
                    </h6>

                    <p className="text-primary mb-2">
                      {person.company || 'Company not provided'}
                    </p>

                    <p className="text-secondary small mb-3">
                      {person.department || 'Department not provided'}
                    </p>

                    {/* Skills */}
                    <div className="d-flex flex-wrap gap-2 mb-4">

                      {(person.skills || []).map((skill) => (
                        <span
                          className="badge bg-light text-dark border"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))}

                    </div>

                    {/* View Profile */}
                    <Link
                      to={`/alumni/${person._id}`}
                      className="btn btn-outline-primary w-100"
                    >
                      View Profile
                    </Link>

                  </div>

                </div>
              ))}

              {/* No Alumni */}
              {filteredAlumni.length === 0 && (
                <div className="text-center py-5">

                  <h5 className="fw-bold">
                    {alumni.length === 0
                      ? 'No approved alumni available yet.'
                      : 'No alumni found'}
                  </h5>

                  <p className="text-secondary">
                    {alumni.length === 0
                      ? 'Approved alumni profiles will appear here.'
                      : 'Try changing your search or department filter.'}
                  </p>

                </div>
              )}

            </div>
          )}

        </div>
      </section>

    </div>
  )
}

export default Alumni
