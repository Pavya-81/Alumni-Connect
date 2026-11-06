function About() {
  const features = [
    {
      number: '01',
      title: 'Connect Students and Alumni',
      description:
        'Help students discover alumni and build meaningful professional relationships.'
    },
    {
      number: '02',
      title: 'Career Opportunities',
      description:
        'Allow verified alumni to share job openings and career opportunities.'
    },
    {
      number: '03',
      title: 'Mentorship',
      description:
        'Encourage knowledge sharing, career guidance and professional growth.'
    },
    {
      number: '04',
      title: 'Verified Community',
      description:
        'Build trust through student ID and alumni card verification with admin review.'
    }
  ]

  return (
    <div className="about-page">

      <section className="about-hero">
        <div className="container text-center">

          <span className="badge bg-primary-subtle text-primary px-3 py-2">
            ABOUT OUR PLATFORM
          </span>

          <h1 className="display-4 fw-bold mt-4">
            Bringing Students and Alumni Together
          </h1>

          <p className="lead text-secondary mt-3 mx-auto about-intro">
            Alumni Connect is a platform designed to strengthen the
            relationship between students and alumni through networking,
            mentorship and career opportunities.
          </p>

        </div>
      </section>

      <section className="container py-5">

        <div className="about-mission">
          <h2 className="fw-bold mb-3">Our Mission</h2>

          <p className="text-secondary mb-0">
            Our mission is to create a trusted college community where
            students can learn from alumni, discover professional
            opportunities and develop connections that last beyond graduation.
          </p>
        </div>

      </section>

      <section className="container pb-5">

        <div className="text-center mb-5">
          <h2 className="fw-bold">What Makes Us Different?</h2>

          <p className="text-secondary">
            Features designed to support the entire college community.
          </p>
        </div>

        <div className="row g-4">

          {features.map((feature) => (
            <div className="col-md-6" key={feature.number}>
              <div className="about-feature h-100">

                <div className="feature-icon">
                  {feature.number}
                </div>

                <h5 className="fw-bold">{feature.title}</h5>

                <p className="text-secondary mb-0">
                  {feature.description}
                </p>

              </div>
            </div>
          ))}

        </div>

      </section>

    </div>
  )
}

export default About