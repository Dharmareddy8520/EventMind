import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { generateMockSessions } from './gemini';

export const MOCK_SESSIONS = [
  { id: "s1", title: "Keynote: The Future of AI in Tech", speaker: "Dr. Jane Smith", speakerTitle: "Chief AI Scientist", track: "AI & Machine Learning", day: 1, startTime: "09:00 AM", endTime: "10:30 AM", room: "Hall A", tags: ["AI", "Future", "Keynote"], description: "Opening keynote on where AI is heading in the next decade." },
  { id: "s2", title: "React Server Components in Practice", speaker: "John Doe", speakerTitle: "Frontend Architect", track: "Web Development", day: 1, startTime: "11:00 AM", endTime: "12:00 PM", room: "Room 204", tags: ["React", "Frontend", "Web"], description: "Deep dive into RSC and how it changes web development." },
  { id: "s3", title: "Cloud Native Architecture", speaker: "Alice Johnson", speakerTitle: "Cloud Engineer", track: "Cloud Computing", day: 2, startTime: "01:00 PM", endTime: "02:00 PM", room: "Hall B", tags: ["Cloud", "Architecture", "Kubernetes"], description: "Best practices for building scalable cloud native applications." }
];

export const getAllSessions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "sessions"));
    if (querySnapshot.empty) {
      console.log("Firestore 'sessions' is empty. Asking Gemini to dynamically generate 20 realistic events...");
      
      try {
        const generatedSessions = await generateMockSessions();
        console.log("Successfully generated dynamically with Gemini! Seeding into Firebase Database...");
        
        const seedPromises = generatedSessions.map(session => 
          setDoc(doc(db, "sessions", String(session.id)), session)
        );
        
        await Promise.all(seedPromises);
        console.log("Firebase Seeding Complete!");
        return generatedSessions;
        
      } catch(genError) {
        console.error("Gemini failed to dynamically generate. Defaulting to static mocks.", genError);
        return MOCK_SESSIONS;
      }
    }
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Firestore read failed, using fallback:", error);
    return MOCK_SESSIONS;
  }
};

export const getUserAttendeeData = async (uid) => {
  try {
    const docRef = doc(db, "attendees", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch(err) {
    console.error("Failed to fetch attendee", err);
    return null;
  }
}

export const TRACKS = ['All', 'AI & Machine Learning', 'Web Development', 'Cloud Computing', 'Data Science', 'Security'];

export const saveUserAttendeeData = async (uid, data) => {
  try {
    await setDoc(doc(db, "attendees", uid), data, { merge: true });
  } catch(err) {
    console.error("Failed to save attendee", err);
  }
}
