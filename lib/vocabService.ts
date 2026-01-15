import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  Unsubscribe
} from "firebase/firestore";
import { db } from "./firebase";

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  date: string;
  createdAt?: Timestamp;
}

// Add a new vocabulary
export const addVocabulary = async (word: string, meaning: string, date: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "vocabularies"), {
      word: word.trim(),
      meaning: meaning.trim(),
      date: date,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding vocabulary:", error);
    throw error;
  }
};

// Get all vocabularies
export const getAllVocabularies = async (): Promise<Vocabulary[]> => {
  try {
    const q = query(collection(db, "vocabularies"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      word: doc.data().word,
      meaning: doc.data().meaning,
      date: doc.data().date,
      createdAt: doc.data().createdAt
    }));
  } catch (error) {
    console.error("Error getting vocabularies:", error);
    throw error;
  }
};

// Get vocabularies by date
export const getVocabulariesByDate = async (date: string): Promise<Vocabulary[]> => {
  try {
    // Try with orderBy first, fallback to without if index not created
    let q = query(
      collection(db, "vocabularies"),
      where("date", "==", date),
      orderBy("createdAt", "desc")
    );
    
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        word: doc.data().word,
        meaning: doc.data().meaning,
        date: doc.data().date,
        createdAt: doc.data().createdAt
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error.code === 'failed-precondition') {
        console.warn("Firestore index not created yet, fetching without orderBy");
        q = query(
          collection(db, "vocabularies"),
          where("date", "==", date)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          word: doc.data().word,
          meaning: doc.data().meaning,
          date: doc.data().date,
          createdAt: doc.data().createdAt
        }));
        // Sort manually by createdAt
        return results.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error getting vocabularies by date:", error);
    throw error;
  }
};

// Subscribe to vocabularies by date (real-time updates)
export const subscribeVocabulariesByDate = (
  date: string,
  callback: (vocabs: Vocabulary[]) => void
): Unsubscribe => {
  try {
    let q = query(
      collection(db, "vocabularies"),
      where("date", "==", date),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const vocabs = snapshot.docs.map(doc => ({
          id: doc.id,
          word: doc.data().word,
          meaning: doc.data().meaning,
          date: doc.data().date,
          createdAt: doc.data().createdAt
        }));
        callback(vocabs);
      },
      (error) => {
        // If index error, try without orderBy
        if (error.code === 'failed-precondition') {
          console.warn("Firestore index not created yet, using fallback query");
          q = query(
            collection(db, "vocabularies"),
            where("date", "==", date)
          );
          return onSnapshot(
            q,
            (snapshot: QuerySnapshot) => {
              const vocabs = snapshot.docs.map(doc => ({
                id: doc.id,
                word: doc.data().word,
                meaning: doc.data().meaning,
                date: doc.data().date,
                createdAt: doc.data().createdAt
              }));
              // Sort manually
              const sorted = vocabs.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                return bTime - aTime;
              });
              callback(sorted);
            },
            (err) => {
              console.error("Error in fallback subscription:", err);
              callback([]);
            }
          );
        }
        console.error("Error subscribing to vocabularies:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up subscription:", error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

// Subscribe to all vocabularies (for total count)
export const subscribeAllVocabularies = (
  callback: (vocabs: Vocabulary[]) => void
): Unsubscribe => {
  try {
    const q = query(collection(db, "vocabularies"), orderBy("createdAt", "desc"));
    
    return onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const vocabs = snapshot.docs.map(doc => ({
          id: doc.id,
          word: doc.data().word,
          meaning: doc.data().meaning,
          date: doc.data().date,
          createdAt: doc.data().createdAt
        }));
        callback(vocabs);
      },
      (error) => {
        // If index error, try without orderBy
        if (error.code === 'failed-precondition') {
          console.warn("Firestore index not created, using fallback");
          const fallbackQ = query(collection(db, "vocabularies"));
          return onSnapshot(
            fallbackQ,
            (snapshot: QuerySnapshot) => {
              const vocabs = snapshot.docs.map(doc => ({
                id: doc.id,
                word: doc.data().word,
                meaning: doc.data().meaning,
                date: doc.data().date,
                createdAt: doc.data().createdAt
              }));
              const sorted = vocabs.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                return bTime - aTime;
              });
              callback(sorted);
            },
            (err) => {
              console.error("Error in fallback subscription:", err);
              callback([]);
            }
          );
        }
        console.error("Error subscribing to all vocabularies:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up subscription:", error);
    callback([]);
    return () => {};
  }
};

// Delete a vocabulary
export const deleteVocabulary = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "vocabularies", id));
  } catch (error) {
    console.error("Error deleting vocabulary:", error);
    throw error;
  }
};

