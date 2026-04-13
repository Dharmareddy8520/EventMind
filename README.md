# ⚡ EventMind — AI-Powered Physical Event Companion

> **Hackathon Submission** · Physical Event Experience Challenge · TechSummit 2026

[![Live Demo](https://img.shields.io/badge/Live-Demo-5B4FE9?style=flat-square)](https://your-deployment-url.web.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev)

---

## 🎯 Chosen Vertical

**Event Attendee Assistant** — A smart, personalized companion that helps conference attendees navigate, plan, and maximize their experience at TechSummit 2026.

---

## 🧠 Approach & Logic

EventMind is built around a single core insight: **every attendee has different goals**, yet most conference apps treat everyone the same.

### Personalization Pipeline
1. **Onboarding** collects role, interests, and experience level
2. **Gemini AI** analyzes the attendee profile against all available sessions
3. **Ranked recommendations** surface the 3 most relevant sessions with a plain-English reason for each match
4. **Smart chatbot** maintains conversation context using the attendee's profile to give personalized answers

### Decision-Making Logic
```
User signs in → Profile check → Onboarding (if new)
                                       ↓
                              Dashboard loads
                                       ↓
                    Gemini API called with [profile + all sessions]
                                       ↓
                    JSON recommendations parsed → displayed with reasons
                                       ↓
                    User bookmarks sessions → Firestore updated
                                       ↓
                    "Add to Calendar" → Google Calendar API called
```

---

## 🚀 How It Works

### 5 Core Features

| Feature | Description | Google Service |
|---|---|---|
| **Smart Sign-In** | One-click Google login with Calendar OAuth scope | Firebase Auth |
| **AI Recommendations** | Personalized session suggestions based on your profile | Gemini AI (gemini-pro) |
| **Session Browser** | Filter by track, day, search speakers/topics | Firebase Firestore |
| **My Agenda** | Bookmark sessions, timeline view, day-by-day planning | Firebase Firestore |
| **Venue Map** | Interactive Google Map with all rooms and directions | Google Maps API |
| **AI Chatbot** | Multi-turn conversation about the event, powered by Gemini | Gemini AI |
| **Calendar Sync** | One-click add any session to Google Calendar with reminders | Google Calendar API |

### User Journey
```
Landing Page → Google Sign-In → Onboarding (role/interests/level)
     → Dashboard (AI recs + event info)
     → Sessions (browse/filter/bookmark)
     → My Agenda (personal schedule + calendar export)
     → Venue Map (navigate rooms + get directions)
     → AI Chat (ask anything about TechSummit)
```

---

## 🏗️ Technical Architecture

```
eventmind/
├── src/
│   ├── services/
│   │   ├── firebase.js      # Firebase init + Auth + Google OAuth
│   │   ├── gemini.js        # Gemini AI: recommendations, chatbot, summaries
│   │   ├── calendar.js      # Google Calendar API: add events, fetch schedule
│   │   └── firestore.js     # Firestore CRUD + mock data fallback
│   ├── context/
│   │   └── AuthContext.js   # Global auth state + profile management
│   ├── components/
│   │   ├── Layout.js        # Sidebar nav + mobile responsive header
│   │   └── SessionCard.js   # Reusable card: bookmark + calendar + AI reason
│   └── pages/
│       ├── LandingPage.js   # Dark hero with animated background
│       ├── OnboardingPage.js # 3-step profile wizard
│       ├── DashboardPage.js  # Home: greeting + AI recs + event info
│       ├── SessionsPage.js   # Full session browser with filters
│       ├── MyAgendaPage.js   # Timeline view of bookmarked sessions
│       ├── MapPage.js        # Google Maps + venue rooms + directions
│       └── ChatPage.js       # Real-time Gemini chatbot
```

### Firestore Data Model
```
attendees/{uid}
  name, email, photoURL
  role, interests[], experienceLevel
  bookmarkedSessions[]
  onboardingComplete, createdAt

sessions/{sessionId}
  title, speaker, speakerTitle, speakerAvatar
  track, day, startTime, endTime, room
  description, tags[], capacity, registered
```

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- A Google account
- Firebase project
- Google Cloud project with APIs enabled

### Required APIs
Enable these in [Google Cloud Console](https://console.cloud.google.com):
- ✅ Gemini API (via [Google AI Studio](https://makersuite.google.com))
- ✅ Google Maps JavaScript API
- ✅ Google Calendar API
- ✅ Firebase Authentication (Google provider)
- ✅ Cloud Firestore

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/eventmind.git
cd eventmind

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your API keys (see .env.example)

# 4. Start development server
npm start
```

### Environment Variables

```env
# Firebase (from Firebase Console → Project Settings)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# Gemini AI (from Google AI Studio)
REACT_APP_GEMINI_API_KEY=

# Google Maps (from Google Cloud Console)
REACT_APP_GOOGLE_MAPS_API_KEY=

# Google OAuth Client ID (for Calendar scope)
REACT_APP_GOOGLE_CLIENT_ID=
```

### Firebase Setup
```bash
# In Firebase Console:
# 1. Enable Authentication → Google provider
# 2. Create Firestore database (production mode)
# 3. Add these Firestore Security Rules:
```

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
    match /attendees/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Seed Session Data (Optional)
```bash
# Run the seed script to populate Firestore with TechSummit sessions
node scripts/seed.js
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Key test scenarios:
# ✅ Auth flow: sign in → onboarding → dashboard
# ✅ Gemini fallback: if API fails, shows interest-matched sessions
# ✅ Calendar: validates token before API call
# ✅ Firestore: falls back to mock data if collection is empty
# ✅ Map: renders fallback grid when Maps API key is missing
```

---

## ♿ Accessibility

EventMind meets **WCAG 2.1 AA** standards:

- ✅ Skip-to-main-content link in `index.html`
- ✅ All interactive elements have `aria-label` attributes
- ✅ `role="tab"/"tablist"` on day selectors
- ✅ `aria-pressed` on toggle buttons (bookmark, track filter)
- ✅ `aria-live="polite"` on loading states and result counts
- ✅ `aria-busy` on async action buttons
- ✅ `role="log"` with `aria-live` on chat conversation
- ✅ Semantic HTML throughout (`<main>`, `<header>`, `<nav>`, `<article>`, `<section>`)
- ✅ Focus-visible styles with 2px accent ring
- ✅ Color contrast ratios exceed 4.5:1 for all text
- ✅ Mobile-responsive with touch targets ≥ 44×44px

---

## 🔒 Security

- ✅ No API keys exposed in client (all via `REACT_APP_` env vars)
- ✅ Firebase Security Rules restrict attendee data to owner only
- ✅ OAuth access tokens stored in `sessionStorage` (not `localStorage`)
- ✅ External links opened with `noopener,noreferrer`
- ✅ `Content-Security-Policy` headers set in Firebase hosting config
- ✅ Input sanitization before Gemini API calls
- ✅ Gemini responses sanitized before `dangerouslySetInnerHTML` (only `**bold**` and `\n` parsed)

---

## 📐 Assumptions Made

1. **TechSummit 2026 is April 15–17** at Nashville Convention Center
2. **Session data** is pre-seeded in Firestore (or uses the built-in mock data fallback)
3. **Google Calendar** requires the user to re-authenticate if the OAuth token expires (session-scoped)
4. **Gemini API** may occasionally timeout; the app gracefully falls back to interest-based filtering
5. **Maps API** key must have `localhost` and the production domain whitelisted
6. All times are in **Central Time (America/Chicago)**

---

## 🎨 Design Decisions

- **Dark landing page, light app interior** — creates a strong first impression while keeping the app easy to use for extended periods
- **Syne + DM Sans** font pairing — distinctive display font with a clean body font, avoiding generic "AI app" aesthetics
- **Timeline view for My Agenda** — mirrors how humans mentally organize their day, not just a list
- **AI reason on every recommendation** — builds trust by explaining *why* Gemini chose each session
- **Skeleton loading states** — perceived performance during Firestore and Gemini API calls
- **Graceful degradation** — every Google service has a fallback (mock data, placeholder map, etc.)

---

## 👤 Author

Built for the **Physical Event Experience** hackathon challenge.

---

## 📄 License

MIT License — free to use, modify, and distribute.
