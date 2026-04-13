import React from 'react';
import { useAuth } from '../context/AuthContext';
import { addToCalendar } from '../services/calendar';
import './SessionCard.css';

const SessionCard = ({ session, animDelay }) => {
  const { profile, updateProfile, getCalendarToken } = useAuth();
  
  const isBookmarked = profile?.bookmarkedSessions?.includes(session.id);
  
  const toggleBookmark = () => {
    let current = profile?.bookmarkedSessions || [];
    if (isBookmarked) {
      current = current.filter(id => id !== session.id);
    } else {
      current = [...current, session.id];
    }
    updateProfile({ bookmarkedSessions: current });
  };
  
  const handleCalendarAdd = async () => {
    const token = getCalendarToken();
    try {
      await addToCalendar(session, token);
      alert('Event added to Google Calendar!');
    } catch(err) {
      alert("Failed to add to calendar:\n\n" + err.message);
    }
  };

  return (
    <div className="session-card glass-panel animate-fade-in-up" style={{ animationDelay: `${animDelay}ms` }}>
      <div className="card-header">
        <span className="track-badge">{session.track}</span>
        <button 
          className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={toggleBookmark}
          aria-label="Toggle bookmark"
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>
      
      <h3 className="card-title">{session.title}</h3>
      
      <div className="card-info">
        <div className="speaker-info">
          <span className="speaker-name">{session.speaker}</span>
          <span className="speaker-title">{session.speakerTitle}</span>
        </div>
      </div>
      
      <div className="card-meta">
        <span className="time-badge">
          Day {session.day} ({['', 'Apr 15', 'Apr 16', 'Apr 17'][session.day]}) • {session.startTime} - {session.endTime}
        </span>
        <span className="room-badge">📍 {session.room}</span>
      </div>
      
      {session.reason && (
        <div className="ai-reason">
          <span className="ai-icon">✨</span>
          <p>{session.reason}</p>
        </div>
      )}
      
      <div className="card-actions">
        <button className="btn--accent outline" onClick={handleCalendarAdd}>
          Add to Calendar
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
