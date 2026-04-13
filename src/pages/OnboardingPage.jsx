import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OnboardingPage.css';

const ROLES = ['Developer', 'Designer', 'Product Manager', 'Founder', 'Student'];
const INTERESTS = ['AI', 'Web', 'Cloud', 'Mobile', 'Security', 'Data', 'UX'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];

const OnboardingPage = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState(profile?.role || '');
  const [interests, setInterests] = useState(profile?.interests || []);
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || '');
  const [step, setStep] = useState(1);

  const toggleInterest = (i) => {
    if (interests.includes(i)) setInterests(interests.filter(x => x !== i));
    else if (interests.length < 3) setInterests([...interests, i]);
  };

  const handleComplete = async () => {
    await updateProfile({ role, interests, experienceLevel, onboardingComplete: true });
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card glass-panel animate-fade-in-up">
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${(step / 3) * 100}%`}}></div>
        </div>

        {step === 1 && (
          <div className="step-content animate-fade-in-up">
            <h2>What describes you best?</h2>
            <div className="options-grid">
              {ROLES.map(r => (
                <button 
                  key={r} 
                  className={`option-btn ${role === r ? 'selected' : ''}`}
                  onClick={() => { setRole(r); setTimeout(() => setStep(2), 300); }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-fade-in-up">
            <h2>What are you interested in?</h2>
            <p className="subtitle">Select up to 3 topics</p>
            <div className="options-grid">
              {INTERESTS.map(i => (
                <button 
                  key={i} 
                  className={`option-btn ${interests.includes(i) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(i)}
                >
                  {i}
                </button>
              ))}
            </div>
            <button 
              className="btn--accent mt-4" 
              onClick={() => setStep(3)}
              disabled={interests.length === 0}
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="step-content animate-fade-in-up">
            <h2>What's your experience level?</h2>
            <div className="options-grid">
              {EXPERIENCE.map(e => (
                <button 
                  key={e} 
                  className={`option-btn ${experienceLevel === e ? 'selected' : ''}`}
                  onClick={() => { setExperienceLevel(e); handleComplete(); }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
