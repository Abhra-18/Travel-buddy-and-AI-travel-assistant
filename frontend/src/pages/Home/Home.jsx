import { Link, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Home.css';

const Home = () => {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section id="home-page" className="home">
      <div className="container home__hero">
        <div className="home__badge">✨ AI-Powered Travel Planning</div>
        <h1 className="home__title">
          Explore the World with <br />
          <span className="gradient-text">TravelMate AI</span>
        </h1>
        <p className="home__subtitle">
          Plan unforgettable journeys with intelligent recommendations,
          personalized itineraries, and real-time travel insights — all in one place.
        </p>
        <div className="home__cta-group">
          <Link to="/register" id="home-get-started-btn" className="btn btn-primary">
            🚀 Get Started Free
          </Link>
          <Link to="/login" id="home-login-btn" className="btn btn-outline">
            Sign In
          </Link>
        </div>

        {/* Decorative Stats */}
        <div className="home__stats">
          {[
            { value: '10K+', label: 'Happy Travelers' },
            { value: '150+', label: 'Destinations' },
            { value: '99%', label: 'Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="home__stat card">
              <span className="home__stat-value gradient-text">{stat.value}</span>
              <span className="home__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
