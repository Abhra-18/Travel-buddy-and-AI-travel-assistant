import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page container animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div className="dashboard-banner-content">
          <h1>Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p>Your next great adventure is waiting. Find buddies, explore trips, or generate an AI itinerary.</p>
        </div>
      </div>

      <div className="dashboard-grid staggered-grid">
        {/* Assessment Card */}
        <div className="dashboard-card card-primary">
          <div className="dashboard-card__icon">🧠</div>
          <h2>Personality Assessment</h2>
          <p>Discover your travel archetype and compatibility factors to find the perfect travel companions.</p>
          <Link to="/assessment" className="btn btn-primary">
            {user?.personalityType ? 'Retake Assessment' : 'Take Assessment'} →
          </Link>
        </div>

        {/* Buddy Finder Card */}
        <div className="dashboard-card">
          <div className="dashboard-card__icon">🤝</div>
          <h2>Buddy Finder</h2>
          <p>Browse highly compatible travelers based on your unique personality profile and travel style.</p>
          <Link to="/buddy-finder" className="btn btn-primary">
            Explore Matches →
          </Link>
        </div>

        {/* Trips Card */}
        <div className="dashboard-card card-success">
          <div className="dashboard-card__icon">🗺️</div>
          <h2>Trip Explorer</h2>
          <p>Browse open trips, join an adventure, or plan your own group trip with travel buddies!</p>
          <Link to="/trips" className="btn btn-primary">
            Explore Trips →
          </Link>
        </div>

        {/* AI Planner Card */}
        <div className="dashboard-card card-accent">
          <div className="dashboard-card__icon">🤖</div>
          <h2>AI Trip Planner</h2>
          <p>Generate a complete, personalized day-by-day itinerary with attractions, food, and hotel suggestions!</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/planner" className="btn btn-primary">
              Create Itinerary ✨
            </Link>
            <Link to="/planner/dashboard" className="btn btn-outline" style={{ background: 'var(--color-surface)' }}>
              Saved Plans
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="dashboard-card">
          <div className="dashboard-card__icon">👤</div>
          <h2>Your Profile</h2>
          <p>Manage your personal details, travel preferences, and upload a profile picture to stand out.</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/profile" className="btn btn-primary">
              View Profile
            </Link>
            <Link to="/profile/edit" className="btn btn-outline" style={{ background: 'var(--color-surface)' }}>
              Edit Details ✏️
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
