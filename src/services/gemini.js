import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the GoogleGenerativeAI sdk
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const askEventAssistant = async (prompt, userContext, history) => {
  try {
    const systemInstruction = `You are EventMind AI, an expert virtual assistant for TechSummit 2026. 
You are helpful, concise, and enthusiastic.
Use this context to personalize: ${userContext}`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction 
    });

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
      parts: [{text: msg.content}]
    }));

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
};

export const getSessionRecommendations = async (profile, sessions) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
    Attendee Profile: Role=${profile.role}, Interests=${profile.interests?.join(',')}, Experience=${profile.experienceLevel}.
    Available Sessions: ${JSON.stringify(sessions.map(s => ({id: s.id, title: s.title, tags: s.tags})))}
    
    Return a valid JSON array of the top 3 session objects recommended for this attendee.
    Each object must have:
    - "id" (the session id)
    - "reason" (a 1-sentence plain-English explanation of why it's a good match)
    
    Return ONLY the raw JSON array. No markdown blocks.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if(text.startsWith('\`\`\`json')){
      text = text.substring(7, text.length - 3);
    }
    
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Recommendation Error:", err);
    // Graceful fallback
    return sessions.slice(0, 3).map(s => ({
      id: s.id,
      reason: "Recommended based on general popularity."
    }));
  }
};

export const generateMockSessions = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Generate exactly 20 realistic tech conference sessions for "TechSummit 2026" hosted at the Nashville Convention Center in Tennessee. 
Make some sessions lightly reference the local area (e.g. using local Nashville tech companies, music industry tech, or southern hospitality themes).
The tracks available are: "AI & Machine Learning", "Web Development", "Cloud Computing", "Data Science", "Security".
Days available are 1, 2, or 3.
Rooms available MUST be exactly from this list to match the venue map: "Hall A — Auditorium", "Hall B — Main Stage", "Room 204", "Room 301".
Times should be realistic throughout the day (e.g. "09:00 AM" to "10:30 AM").
Return a raw, valid JSON array of objects.
Each object MUST have these EXACT keys:
- id: a unique string like "gen-1", "gen-2"
- title: string
- speaker: string (mock name)
- speakerTitle: string (mock title)
- track: string (must match one of the tracks exactly)
- day: number (1, 2, or 3)
- startTime: string
- endTime: string
- room: string
- tags: array of 3 string tags
- description: string (1 sentence)

Return ONLY the raw JSON array. DO NOT wrap the output in markdown code blocks or add any other text. Start exactly with [ and end exactly with ].`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if(text.startsWith('```json')){
      text = text.substring(7, text.length - 3);
    } else if(text.startsWith('```')) {
      text = text.substring(3, text.length - 3);
    }
    
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Generation Error:", err);
    throw err;
  }
};
