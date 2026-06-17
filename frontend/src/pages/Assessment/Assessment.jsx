import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';
import './Assessment.css';

const questions = [
  {
    id: 'luxuryLevel',
    title: 'What is your budget style?',
    options: [
      { label: 'Luxury', desc: '5-star hotels & fine dining' },
      { label: 'Moderate', desc: 'Comfortable & balanced' },
      { label: 'Budget', desc: 'Hostels & street food' },
    ]
  },
  {
    id: 'adventureLevel',
    title: 'How adventurous are you?',
    options: [
      { label: 'High', desc: 'Skydiving & trekking' },
      { label: 'Moderate', desc: 'Light hiking & exploring' },
      { label: 'Low', desc: 'Museums & relaxing' },
    ]
  },
  {
    id: 'foodPreferences',
    title: 'What is your food vibe?',
    options: [
      { label: 'Fine Dining', desc: 'Michelin stars & reservations' },
      { label: 'Casual', desc: 'Local cafes & pubs' },
      { label: 'Street Food', desc: 'Night markets & stalls' },
    ]
  },
  {
    id: 'travelPace',
    title: 'What is your ideal travel pace?',
    options: [
      { label: 'Fast', desc: 'See everything possible' },
      { label: 'Moderate', desc: 'A mix of active & chill' },
      { label: 'Slow', desc: 'Deep dive into one place' },
    ]
  },
  {
    id: 'socialPersonality',
    title: 'How do you socialize on trips?',
    options: [
      { label: 'Extrovert', desc: 'Love meeting new people' },
      { label: 'Ambivert', desc: 'Depends on my mood' },
      { label: 'Introvert', desc: 'Keep to myself or my group' },
    ]
  },
  {
    id: 'sleepSchedule',
    title: 'What is your sleep schedule?',
    options: [
      { label: 'Early Bird', desc: 'Up before sunrise' },
      { label: 'Flexible', desc: 'Sleep in a bit' },
      { label: 'Night Owl', desc: 'Out late, sleep late' },
    ]
  }
];

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const currentQ = questions[currentStep];

  const handleSelect = (value) => {
    setAnswers({ ...answers, [currentQ.id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/assessment', answers);
      if (data.success) {
        // Update global user state with new personality data
        updateUser((prev) => ({
          ...prev,
          personalityType: data.data.personalityType,
          compatibilityFactors: data.data.compatibilityFactors,
          assessmentAnswers: data.data.assessmentAnswers
        }));
        navigate('/assessment/results', { state: data.data });
      }
    } catch (err) {
      console.error('Failed to submit assessment', err);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const isSelected = (val) => answers[currentQ.id] === val;

  return (
    <div className="container">
      <div className="assessment-container">
        
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="question-header">
          <p>Question {currentStep + 1} of {questions.length}</p>
          <h2>{currentQ.title}</h2>
        </div>

        <div className="options-grid">
          {currentQ.options.map((opt, i) => (
            <div 
              key={i} 
              className={`option-card ${isSelected(opt.label) ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.label)}
            >
              <h3>{opt.label}</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>
            </div>
          ))}
        </div>

        <div className="assessment-controls">
          <button 
            className="btn btn-outline" 
            onClick={handleBack} 
            disabled={currentStep === 0}
          >
            Back
          </button>
          
          {currentStep === questions.length - 1 ? (
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={!answers[currentQ.id] || loading}
            >
              {loading ? 'Analyzing...' : 'See My Results'}
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
            >
              Next
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Assessment;
