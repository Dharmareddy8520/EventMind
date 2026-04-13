import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllSessions, MOCK_SESSIONS } from '../services/firestore';
import SessionCard from '../components/SessionCard';
import './MyAgendaPage.css';

const MyAgendaPage = () => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAllSessions();
      setSessions(data.length ? data : MOCK_SESSIONS);
      setLoading(false);
    };
    load();
  }, []);

  const bookmarked = useMemo(() => {
    if (!profile?.bookmarkedSessions?.length) return [];
    return sessions.filter(s => profile.bookmarkedSessions.includes(s.id));
  }, [sessions, profile?.bookmarkedSessions]);

  const byDay = useMemo(() => {
    return bookmarked
      .filter(s => s.day === activeDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookmarked, activeDay]);

  const DAYS = [
    { num: 1, label: 'Day 1', date: 'Apr 15' },
    { num: 2, label: 'Day 2', date: 'Apr 16' },
    { num: 3, label: 'Day 3', date: 'Apr 17' },
  ];

  const totalByDay = (day) => bookmarked.filter(s => s.day === day).length;

  return (
    <div className="agenda-page">
      <header className="agenda__header animate-fade-in-up">
        <div>
          <h1 className="page__title">My Agenda</h1>
          <p className="page__subtitle">
            {bookmarked.length} session{bookmarked.length !== 1 ? 's' : ''} saved
            across {DAYS.filter(d => totalByDay(d.num) > 0).length} day{DAYS.filter(d => totalByDay(d.num) > 0).length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="agenda__stats">
          {DAYS.map(d => (
            <div key={d.num} className="stat__pill">
              <span className="stat__pill-label">{d.label}</span>
              <span className="stat__pill-count">{totalByDay(d.num)}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Day tabs */}
      <div className="agenda__tabs" role="tablist" aria-label="Select day">
        {DAYS.map(d => (
          <button
            key={d.num}
            role="tab"
            aria-selected={activeDay === d.num}
            className={`agenda__tab ${activeDay === d.num ? 'agenda__tab--active' : ''}`}
            onClick={() => setActiveDay(d.num)}
          >
            <span className="tab__day">{d.label}</span>
            <span className="tab__date">{d.date}</span>
            {totalByDay(d.num) > 0 && (
              <span className="tab__badge">{totalByDay(d.num)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline view */}
      <div
        className="agenda__content animate-fade-in"
        role="tabpanel"
        aria-label={`Day ${activeDay} agenda`}
      >
        {loading ? (
          <div aria-label="Loading agenda">
            {[1, 2].map(i => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 12 }} />
            ))}
          </div>
        ) : byDay.length === 0 ? (
          <div className="agenda__empty">
            <p className="empty__icon" aria-hidden="true">📌</p>
            <h3>No sessions saved for Day {activeDay}</h3>
            <p>Browse sessions and tap the pin icon to add them to your agenda.</p>
            <a href="/sessions" className="btn--accent">Browse Sessions →</a>
          </div>
        ) : (
          <div className="timeline">
            {byDay.map((session, i) => (
              <div key={session.id} className="timeline__item">
                {/* Time axis */}
                <div className="timeline__time" aria-hidden="true">
                  <span className="time__start">{session.startTime}</span>
                  <div className="time__line" />
                  <span className="time__end">{session.endTime}</span>
                </div>
                {/* Card */}
                <div className="timeline__card">
                  <SessionCard session={session} animDelay={i * 80} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export tip */}
      {bookmarked.length > 0 && (
        <div className="agenda__tip animate-fade-in-up">
          <span aria-hidden="true">💡</span>
          <p>
            Use the <strong>"Add to Google Calendar"</strong> button on each session
            to sync your agenda with your personal calendar automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyAgendaPage;
