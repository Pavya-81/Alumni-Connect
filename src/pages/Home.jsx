
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      setIsLoggedIn(Boolean(token && user))
    }

    checkLogin()
    window.addEventListener('storage', checkLogin)

    return () => {
      window.removeEventListener('storage', checkLogin)
    }
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-7">
              <span className="badge bg-primary-subtle text-primary px-3 py-2 mb-3">
                ALUMNI CONNECT PLATFORM
              </span>

              <h1 className="display-3 fw-bold mb-4">
                Connect. Network. <span className="text-primary">Grow.</span>
              </h1>

              <p className="lead text-secondary mb-4">
                Build meaningful connections between students and alumni,
                discover career opportunities, share knowledge, and grow
                together as a professional community.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                {!isLoggedIn && (
                  <Link to="/register" className="btn btn-primary btn-lg px-4">
                    Get Started
                  </Link>
                )}

                <a
                  href="#why-alumni"
                  className="btn btn-outline-primary btn-lg px-4"
                >
                  Explore Alumni Connect
                </a>
              </div>
            </div>

            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="hero-card shadow-lg">
                <div className="hero-card-icon">
                  <span>AC</span>
                </div>

                <h3 className="fw-bold mt-4">Your Alumni Community</h3>

                <p className="text-secondary">
                  Connect with experienced alumni and discover new
                  opportunities for your career journey.
                </p>

                <div className="row text-center mt-4">
                  <div className="col-4">
                    <h4 className="fw-bold text-primary">500+</h4>
                    <small className="text-secondary">Alumni</small>
                  </div>

                  <div className="col-4">
                    <h4 className="fw-bold text-primary">100+</h4>
                    <small className="text-secondary">Jobs</small>
                  </div>

                  <div className="col-4">
                    <h4 className="fw-bold text-primary">50+</h4>
                    <small className="text-secondary">Companies</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Alumni Connect */}
      <section id="why-alumni" className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-primary fw-semibold">
              WHY ALUMNI CONNECT?
            </span>

            <h2 className="fw-bold mt-2">
              Everything You Need to Grow
            </h2>

            <p className="text-secondary">
              A platform designed to bring students and alumni together.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100">
                <div className="feature-icon">01</div>
                <h5 className="fw-bold">Alumni Network</h5>
                <p className="text-secondary">
                  Discover and connect with alumni from different
                  industries and organizations.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100">
                <div className="feature-icon">02</div>
                <h5 className="fw-bold">Career Opportunities</h5>
                <p className="text-secondary">
                  Find job opportunities and career openings shared
                  by alumni.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100">
                <div className="feature-icon">03</div>
                <h5 className="fw-bold">Mentorship</h5>
                <p className="text-secondary">
                  Learn from experienced professionals and get
                  valuable career guidance.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="feature-card h-100">
                <div className="feature-icon">04</div>
                <h5 className="fw-bold">Community</h5>
                <p className="text-secondary">
                  Build long-term professional relationships with
                  your college community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-5">
          <div className="container">
            <div className="cta-section text-center">
              <h2 className="fw-bold">
                Ready to Connect With Your Alumni?
              </h2>

              <p className="mb-4">
                Join the Alumni Connect community and start building
                meaningful professional connections.
              </p>

              <Link
                to="/register"
                className="btn btn-light btn-lg px-5"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
