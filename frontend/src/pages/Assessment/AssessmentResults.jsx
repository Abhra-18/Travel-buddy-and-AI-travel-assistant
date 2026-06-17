import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Assessment.css';

const AssessmentResults = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fallback to user context if they navigated here directly
  const personalityType = state?.personalityType || user?.personalityType;
  const compatibilityFactors = state?.compatibilityFactors || user?.compatibilityFactors;

  if (!personalityType) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>You haven't taken the assessment yet!</h2>
        <button className="btn btn-primary" onClick={() => navigate('/assessment')} style={{ marginTop: '1rem' }}>
          Take it now
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="results-container">
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Your AI-Generated Travel Archetype is:
        </p>
        <h1 className="archetype-title">
          {personalityType}
        </h1>
        
        <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', maxWidth: '600px', margin: '2rem auto' }}>
          Based on your unique preferences, we've analyzed your travel style. 
          Here are your core compatibility traits. We will use these to match you 
          with the perfect travel buddies!
        </p>

        <div className="compatibility-grid">
          {compatibilityFactors.map((trait, i) => (
            <div 
              key={i} 
              className="compatibility-badge"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              ✨ {trait}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '4rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/assessment')} style={{ marginLeft: '1rem' }}>
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
