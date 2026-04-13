export const addToCalendar = async (session, token) => {
  if (!token) {
    alert("Please sign in with Google Calendar access first.");
    return;
  }

  // Parse time naively for demo purposes
  const parseTime = (timeStr, dayNum) => {
    // day 1: April 15, day 2: April 16, day 3: April 17 (2026)
    const dayMap = { 1: 15, 2: 16, 3: 17 };
    const day = dayMap[dayNum];
    
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const yy = 2026;
    const mm = '04'; // Month is April (04)
    const dd = day.toString().padStart(2, '0');
    const hh = hours.toString().padStart(2, '0');
    const m = minutes.padStart(2, '0');
    
    // Format as YYYY-MM-DDTHH:mm:ss without 'Z' so it uses the specified timeZone
    return `${yy}-${mm}-${dd}T${hh}:${m}:00`;
  };

  const event = {
    summary: session.title,
    location: `TechSummit 2026 - ${session.room}`,
    description: `Time: Day ${session.day} (${['', 'Apr 15', 'Apr 16', 'Apr 17'][session.day]}) • ${session.startTime} - ${session.endTime}\nSpeaker: ${session.speaker}\n\n${session.description}`,
    start: {
      dateTime: parseTime(session.startTime, session.day),
      timeZone: 'America/Chicago',
    },
    end: {
      dateTime: parseTime(session.endTime, session.day),
      timeZone: 'America/Chicago',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
        { method: 'email', minutes: 60 },
      ],
    },
  };

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar API error: ${response.status} ${errorText}`);
    }
    return await response.json();
  } catch(err) {
    console.error("Calendar API Error:", err);
    throw err;
  }
};
