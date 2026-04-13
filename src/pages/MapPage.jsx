import React, { useEffect, useRef, useState } from 'react';
import './MapPage.css';

const VENUE_ROOMS = [
  {
    id: 'hall-a',
    name: 'Hall A — Auditorium',
    description: 'Main keynote stage. Capacity: 500',
    lat: 36.1607,
    lng: -86.7787,
    type: 'main',
    icon: '🎤',
    sessions: ['Opening Keynote', 'Building Production-Ready LLM Applications', 'Zero Trust Security'],
  },
  {
    id: 'hall-b',
    name: 'Hall B — Main Stage',
    description: 'Primary session hall. Capacity: 400',
    lat: 36.1612,
    lng: -86.7790,
    type: 'main',
    icon: '📡',
    sessions: ['Kubernetes at Scale', 'React Server Components', 'Platform Engineering'],
  },
  {
    id: 'hall-c',
    name: 'Hall C — Lunch & Networking',
    description: 'Lunch served 12:00–1:30 PM daily',
    lat: 36.1600,
    lng: -86.7785,
    type: 'food',
    icon: '🍽',
    sessions: ['Lunch (12:00–1:30 PM)', 'Coffee Breaks', 'Evening Mixer Day 1'],
  },
  {
    id: 'room-204',
    name: 'Room 204',
    description: 'UX & Design track. Capacity: 200',
    lat: 36.1615,
    lng: -86.7782,
    type: 'breakout',
    icon: '🎨',
    sessions: ['Designing for Cognitive Accessibility'],
  },
  {
    id: 'room-301',
    name: 'Room 301',
    description: 'Systems & Languages track. Capacity: 250',
    lat: 36.1618,
    lng: -86.7793,
    type: 'breakout',
    icon: '⚙️',
    sessions: ['Rust for Systems Programmers'],
  },
  {
    id: 'registration',
    name: 'Registration Desk',
    description: 'Hall A entrance. Opens 8:00 AM daily',
    lat: 36.1604,
    lng: -86.7780,
    type: 'info',
    icon: '🪪',
    sessions: ['Check-in', 'Badge pickup', 'Info desk'],
  },
  {
    id: 'rooftop',
    name: 'Rooftop Terrace',
    description: 'Networking dinner Day 1, 7:00 PM',
    lat: 36.1622,
    lng: -86.7786,
    type: 'social',
    icon: '🌃',
    sessions: ['Day 1 Networking Dinner (7:00 PM)'],
  },
];

const TYPE_LABELS = {
  main: { label: 'Main Stage', color: '#5B4FE9' },
  breakout: { label: 'Breakout Room', color: '#19C8A6' },
  food: { label: 'Food & Networking', color: '#E8B84B' },
  info: { label: 'Info', color: '#378ADD' },
  social: { label: 'Social', color: '#D4537E' },
};

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_maps_api_key') {
      setMapError(true);
      return;
    }

    if (window.google?.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    const center = { lat: 36.1610, lng: -86.7786 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 17,
      mapTypeId: 'roadmap',
      styles: [
        { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f5' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#d0d0d0' }] },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    mapInstance.current = map;

    // Add venue boundary polygon
    const venueCoords = [
      { lat: 36.1598, lng: -86.7795 },
      { lat: 36.1625, lng: -86.7795 },
      { lat: 36.1625, lng: -86.7775 },
      { lat: 36.1598, lng: -86.7775 },
    ];

    new window.google.maps.Polygon({
      paths: venueCoords,
      strokeColor: '#5B4FE9',
      strokeOpacity: 0.4,
      strokeWeight: 2,
      fillColor: '#5B4FE9',
      fillOpacity: 0.04,
      map,
    });

    // Add markers for each room
    VENUE_ROOMS.forEach(room => {
      const color = TYPE_LABELS[room.type]?.color || '#5B4FE9';

      const marker = new window.google.maps.Marker({
        position: { lat: room.lat, lng: room.lng },
        map,
        title: room.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        label: {
          text: room.icon,
          fontSize: '13px',
        },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        setSelectedRoom(room);
        map.panTo({ lat: room.lat, lng: room.lng });
      });

      markersRef.current.push(marker);
    });

    setMapLoaded(true);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    if (mapInstance.current) {
      mapInstance.current.panTo({ lat: room.lat, lng: room.lng });
      mapInstance.current.setZoom(18);
    }
  };

  const openDirections = (room) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${room.lat},${room.lng}&destination_place_id=Nashville+Convention+Center`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="map-page">
      <header className="map__header animate-fade-in-up">
        <div>
          <h1 className="page__title">Venue Map</h1>
          <p className="page__subtitle">Nashville Convention Center · Navigate with ease</p>
        </div>
        <div className="map__legend" aria-label="Map legend">
          {Object.entries(TYPE_LABELS).map(([type, info]) => (
            <div key={type} className="legend__item">
              <span
                className="legend__dot"
                style={{ background: info.color }}
                aria-hidden="true"
              />
              <span className="legend__label">{info.label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="map__layout animate-fade-in-up delay-100">
        {/* Rooms sidebar */}
        <div className="rooms__list" role="list" aria-label="Venue rooms">
          {VENUE_ROOMS.map(room => (
            <button
              key={room.id}
              role="listitem"
              className={`room__item ${selectedRoom?.id === room.id ? 'room__item--active' : ''}`}
              onClick={() => handleRoomSelect(room)}
              aria-pressed={selectedRoom?.id === room.id}
              aria-label={room.name}
            >
              <span className="room__icon" aria-hidden="true">{room.icon}</span>
              <div className="room__info">
                <div className="room__name">{room.name}</div>
                <div className="room__desc">{room.description}</div>
              </div>
              <span
                className="room__type-dot"
                style={{ background: TYPE_LABELS[room.type]?.color }}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        {/* Map + Detail panel */}
        <div className="map__main">
          {/* Google Map */}
          <div className="map__container" aria-label="Interactive venue map">
            {mapError ? (
              <div className="map__placeholder" role="img" aria-label="Venue layout diagram">
                <div className="placeholder__grid">
                  {VENUE_ROOMS.map(room => (
                    <button
                      key={room.id}
                      className={`placeholder__room placeholder__room--${room.type} ${selectedRoom?.id === room.id ? 'placeholder__room--selected' : ''}`}
                      onClick={() => setSelectedRoom(room)}
                      aria-label={room.name}
                    >
                      <span aria-hidden="true">{room.icon}</span>
                      <span>{room.name.split(' — ')[0]}</span>
                    </button>
                  ))}
                </div>
                <p className="placeholder__note">
                  Add your Google Maps API key to enable the interactive map.
                </p>
              </div>
            ) : (
              <div ref={mapRef} className="map__google" aria-label="Google Maps" />
            )}
          </div>

          {/* Room detail panel */}
          {selectedRoom && (
            <div
              className="room__detail animate-slide-in"
              role="region"
              aria-label={`Details for ${selectedRoom.name}`}
            >
              <div className="detail__header">
                <span className="detail__icon" aria-hidden="true">{selectedRoom.icon}</span>
                <div>
                  <h2 className="detail__name">{selectedRoom.name}</h2>
                  <p className="detail__desc">{selectedRoom.description}</p>
                </div>
                <button
                  className="detail__close"
                  onClick={() => setSelectedRoom(null)}
                  aria-label="Close room details"
                >
                  ✕
                </button>
              </div>

              <div className="detail__sessions">
                <h3 className="detail__sessions-title">Sessions here</h3>
                <ul className="detail__sessions-list">
                  {selectedRoom.sessions.map(session => (
                    <li key={session} className="detail__session-item">
                      <span aria-hidden="true">▸</span> {session}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="btn__directions"
                onClick={() => openDirections(selectedRoom)}
                aria-label={`Get directions to ${selectedRoom.name}`}
              >
                <span aria-hidden="true">🗺</span> Get Directions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
