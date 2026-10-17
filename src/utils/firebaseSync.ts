import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { JobApplication, CandidateProfile } from '../types/job';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export const FirebaseSync = {
  // Google Sign-In
  async loginWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Upsert user profile document
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || 'Job Seeker',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Save Candidate Profile to Firestore
  async saveCandidateProfile(userId: string, profile: CandidateProfile): Promise<void> {
    const path = `users/${userId}`;
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        userId,
        email: profile.email,
        displayName: profile.name,
        phoneNumber: profile.phoneNumber || '',
        location: profile.location || '',
        headline: profile.headline,
        targetRole: profile.targetRole || '',
        bio: profile.bio || '',
        linkedInUrl: profile.linkedInUrl || '',
        githubUrl: profile.githubUrl || '',
        education: profile.education.map((e: CandidateProfile['education'][number]) => `${e.degree} in ${e.field} - ${e.institution} (${e.gradYear})`).join('; '),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Subscribe to Auth State
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Save / Upsert Job Application in Firestore
  async saveApplication(userId: string, job: JobApplication): Promise<void> {
    const path = `users/${userId}/applications/${job.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'applications', job.id);
      await setDoc(docRef, {
        ...job,
        userId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete Job Application from Firestore
  async deleteApplication(userId: string, jobId: string): Promise<void> {
    const path = `users/${userId}/applications/${jobId}`;
    try {
      const docRef = doc(db, 'users', userId, 'applications', jobId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Batch sync applications to Firestore (e.g. on first sign-in)
  async syncAllApplications(userId: string, applications: JobApplication[]): Promise<void> {
    for (const app of applications) {
      await this.saveApplication(userId, app);
    }
  },

  // Subscribe to real-time applications collection in Firestore
  subscribeApplications(
    userId: string,
    onData: (apps: JobApplication[]) => void,
    onError?: (error: Error) => void
  ) {
    const path = `users/${userId}/applications`;
    const colRef = collection(db, 'users', userId, 'applications');

    return onSnapshot(
      colRef,
      (snapshot) => {
        const apps: JobApplication[] = [];
        snapshot.forEach((d) => {
          apps.push(d.data() as JobApplication);
        });
        onData(apps);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error as Error);
      }
    );
  },

  // Save chat message to Firestore
  async saveChatMessage(userId: string, message: ChatMessage): Promise<void> {
    const path = `users/${userId}/messages/${message.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'messages', message.id);
      await setDoc(docRef, {
        ...message,
        userId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Load chat messages from Firestore
  async loadChatMessages(userId: string): Promise<ChatMessage[]> {
    const path = `users/${userId}/messages`;
    try {
      const colRef = collection(db, 'users', userId, 'messages');
      const snap = await getDocs(colRef);
      const messages: ChatMessage[] = [];
      snap.forEach(d => {
        messages.push(d.data() as ChatMessage);
      });
      // Sort by timestamp
      return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }
};
