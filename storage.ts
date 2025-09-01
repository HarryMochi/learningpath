// This file is no longer used for course storage, which has been migrated to Firebase Firestore.
// It is kept in case local storage is needed for other features in the future.

"use client";

// Example of a function that could be used for other local storage needs.
export function getLocalStorageItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(key);
}

export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, value);
}
