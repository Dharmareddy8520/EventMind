import React, { useState, useEffect, useMemo } from 'react';
import { getAllSessions, MOCK_SESSIONS, TRACKS } from '../services/firestore';
import SessionCard from '../components/SessionCard';
import './SessionsPage.css';

const DAY_FILTERS = ['All Days', 'Day 1 — Apr 15', 'Day 2 — Apr 16', 'Day 3 — Apr 17'];

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTrack, setActiveTrack] = useState('All');
  const [activeDay, setActiveDay] = useState('All Days');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAllSessions();
      setSessions(data.length ? data : MOCK_SESSIONS);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      const matchTrack = activeTrack === 'All' || s.track === activeTrack;
      const matchDay =
        activeDay === 'All Days' || s.day === DAY_FILTERS.indexOf(activeDay);
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.speaker.toLowerCase().includes(search.toLowerCase()) ||
        s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchTrack && matchDay && matchSearch;
    });
  }, [sessions, activeTrack, activeDay, search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(s => {
      const key = `Day ${s.day} — ${['', 'Apr 15', 'Apr 16', 'Apr 17'][s.day]}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="sessions-page">
      <header className="sessions__header animate-fade-in-up">
        <div>
          <h1 className="page__title">Sessions</h1>
          <p className="page__subtitle">
            {sessions.length} sessions across 3 days — find yours
          </p>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="sessions__filters animate-fade-in-up delay-100">
        <div className="search__wrap">
          <span className="search__icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="search__input"
            placeholder="Search sessions, speakers, topics…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search sessions"
          />
          {search && (
            <button
              className="search__clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter__row" role="group" aria-label="Filter by day">
          {DAY_FILTERS.map(day => (
            <button
              key={day}
              className={`filter__chip ${activeDay === day ? 'filter__chip--active' : ''}`}
              onClick={() => setActiveDay(day)}
              aria-pressed={activeDay === day}
            >
              {day}
            </button>
          ))}
        </div>

        <div
          className="track__filter"
          role="group"
          aria-label="Filter by track"
        >
          {TRACKS.map(track => (
            <button
              key={track}
              className={`track__chip ${activeTrack === track ? 'track__chip--active' : ''}`}
              onClick={() => setActiveTrack(track)}
              aria-pressed={activeTrack === track}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="sessions__count" aria-live="polite">
        {loading ? 'Loading sessions…' : `${filtered.length} session${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Sessions grouped by day */}
      {loading ? (
        <div className="sessions__skeleton" aria-label="Loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16, marginBottom: 16 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="sessions__empty" role="status">
          <p className="empty__icon" aria-hidden="true">🔎</p>
          <p>No sessions match your filters.</p>
          <button
            className="btn--outline"
            onClick={() => { setSearch(''); setActiveTrack('All'); setActiveDay('All Days'); }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([dayLabel, daySessions]) => (
          <section key={dayLabel} className="day__group animate-fade-in-up" aria-labelledby={`day-${dayLabel}`}>
            <h2 className="day__group-title" id={`day-${dayLabel}`}>
              {dayLabel}
              <span className="day__group-count">{daySessions.length}</span>
            </h2>
            <div className="sessions__grid">
              {daySessions.map((session, i) => (
                <SessionCard key={session.id} session={session} animDelay={i * 60} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default SessionsPage;
