import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllSessions } from '../services/firestore';
import { getSessionRecommendations } from '../services/gemini';
import SessionCard from '../components/SessionCard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      const allSessions = await getAllSessions();
      if (!profile) return;
      
      const recommendationsConfig = await getSessionRecommendations(profile, allSessions);
      
      const fullRecs = recommendationsConfig.map(r => {
        const session = allSessions.find(s => s.id === r.id);
        return { ...session, reason: r.reason };
      }).filter(s => s.title); // Filter out any unknown IDs

      setRecs(fullRecs);
      setLoading(false);
    };

    fetchRecs();
  }, [profile]);

  return (
    <div className="dashboard-page animate-fade-in-up">
      <header className="dashboard-header glass-panel">
        <div>
          <h1 className="greeting">Good morning, {user?.displayName?.split(' ')[0]} 👋</h1>
          <p className="subtitle">Ready for day 1 of TechSummit 2026?</p>
        </div>
      </header>

      <section className="recs-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="sparkle">✨</span> AI Recommendations
          </h2>
          <p className="section-subtitle">Personalized for your {profile?.role} goals</p>
        </div>

        {loading ? (
          <div className="recs-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card glass-panel"></div>
            ))}
          </div>
        ) : (
          <div className="recs-grid">
            {recs.map((session, i) => (
              <SessionCard key={session.id} session={session} animDelay={i * 100} />
            ))}
          </div>
        )}
      </section>

      <section className="quick-actions">
        <h2 className="section-title">Event Navigation</h2>
        <div className="actions-grid">
          <Link to="/sessions" className="action-card glass-panel">
            <h3>Browse All Sessions</h3>
            <p>Filter and find by topic</p>
          </Link>
          <Link to="/agenda" className="action-card glass-panel">
            <h3>My Agenda</h3>
            <p>View your booked schedule</p>
          </Link>
          <Link to="/map" className="action-card glass-panel">
            <h3>Venue Map</h3>
            <p>Find rooms and routing</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
