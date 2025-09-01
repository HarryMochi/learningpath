import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import type { Course, CourseData, Step } from './types';

const coursesCollection = collection(db, 'courses');

// Create
export async function addCourse(courseData: CourseData): Promise<string> {
  const docRef = await addDoc(coursesCollection, courseData);
  return docRef.id;
}

// Read
export async function getCoursesForUser(userId: string): Promise<Course[]> {
  const q = query(coursesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

// Update
export async function updateCourse(courseId: string, updates: Partial<CourseData>): Promise<void> {
  const courseDoc = doc(db, 'courses', courseId);
  await updateDoc(courseDoc, updates);
}

// Delete
export async function deleteCourse(courseId: string): Promise<void> {
  const courseDoc = doc(db, 'courses', courseId);
  await deleteDoc(courseDoc);
}
