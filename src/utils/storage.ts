/**
 * IndexedDB storage utility to persist user's uploaded song (MP3/WAV)
 * and custom cover photo across browser sessions.
 */

const DB_NAME = 'herseyim_player_db';
const DB_VERSION = 1;
const STORE_NAME = 'song_data';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomSong(data: {
  audioBlob?: Blob;
  fileName: string;
  title: string;
  artist: string;
  dedication?: string;
  coverBlob?: Blob;
  duration?: number;
}): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.put(data, 'current_song');

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCustomSong(): Promise<{
  audioBlob?: Blob;
  fileName: string;
  title: string;
  artist: string;
  dedication?: string;
  coverBlob?: Blob;
  duration?: number;
} | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get('current_song');

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB read error:', err);
    return null;
  }
}

export async function clearCustomSong(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete('current_song');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
