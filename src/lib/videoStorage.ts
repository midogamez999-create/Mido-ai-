// Fast, non-blocking Memory & IndexedDB Storage for Large Video Files & Streams
const DB_NAME = 'MidoOrbVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

// In-memory cache for ultra-fast zero-latency lookup
const memoryBlobMap = new Map<string, Blob>();
const memoryUrlMap = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
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

export function cacheInMemoryBlob(idOrUrl: string, blob: Blob): string {
  if (!idOrUrl || !blob) return '';
  memoryBlobMap.set(idOrUrl, blob);
  const cleanKey = idOrUrl.replace('idb://', '');
  memoryBlobMap.set(cleanKey, blob);
  
  let objUrl = memoryUrlMap.get(idOrUrl) || memoryUrlMap.get(cleanKey);
  if (!objUrl) {
    objUrl = URL.createObjectURL(blob);
    memoryUrlMap.set(idOrUrl, objUrl);
    memoryUrlMap.set(cleanKey, objUrl);
  }
  return objUrl;
}

export async function storeVideoBlob(id: string, fileOrBlob: Blob): Promise<string> {
  if (!id || !fileOrBlob) return '';
  const cleanId = id.replace('idb://', '');
  cacheInMemoryBlob(id, fileOrBlob);
  cacheInMemoryBlob(cleanId, fileOrBlob);

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fileOrBlob, cleanId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB persistence warning (using memory cache):', err);
  }
  return `idb://${cleanId}`;
}

export async function linkServerUrlToBlob(serverUrl: string, fileOrBlob: Blob): Promise<void> {
  if (!serverUrl || !fileOrBlob) return;
  cacheInMemoryBlob(serverUrl, fileOrBlob);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fileOrBlob, serverUrl);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB serverUrl link warning:', err);
  }
}

export function getSyncVideoBlobUrl(videoUrlOrKey: string): string | null {
  if (!videoUrlOrKey) return null;
  if (videoUrlOrKey.startsWith('blob:')) return videoUrlOrKey;
  if (memoryUrlMap.has(videoUrlOrKey)) return memoryUrlMap.get(videoUrlOrKey)!;
  const cleanId = videoUrlOrKey.replace('idb://', '');
  if (memoryUrlMap.has(cleanId)) return memoryUrlMap.get(cleanId)!;
  return null;
}

export async function getVideoBlobUrl(videoUrlOrKey: string): Promise<string> {
  if (!videoUrlOrKey) return '';
  if (videoUrlOrKey.startsWith('blob:')) return videoUrlOrKey;
  
  // 1. Check in-memory maps first for zero latency
  const syncUrl = getSyncVideoBlobUrl(videoUrlOrKey);
  if (syncUrl) return syncUrl;
  if (memoryBlobMap.has(videoUrlOrKey)) {
    const blob = memoryBlobMap.get(videoUrlOrKey)!;
    const url = URL.createObjectURL(blob);
    memoryUrlMap.set(videoUrlOrKey, url);
    return url;
  }

  const cleanId = videoUrlOrKey.replace('idb://', '');
  if (memoryUrlMap.has(cleanId)) {
    return memoryUrlMap.get(cleanId)!;
  }
  if (memoryBlobMap.has(cleanId)) {
    const blob = memoryBlobMap.get(cleanId)!;
    const url = URL.createObjectURL(blob);
    memoryUrlMap.set(cleanId, url);
    return url;
  }

  // 2. Query IndexedDB for local blob
  try {
    const db = await openDB();
    const resultBlob = await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      
      const req1 = store.get(cleanId);
      req1.onsuccess = () => {
        if (req1.result instanceof Blob) {
          resolve(req1.result);
        } else if (videoUrlOrKey !== cleanId) {
          const req2 = store.get(videoUrlOrKey);
          req2.onsuccess = () => resolve(req2.result instanceof Blob ? req2.result : null);
          req2.onerror = () => resolve(null);
        } else {
          resolve(null);
        }
      };
      req1.onerror = () => resolve(null);
    });

    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      memoryBlobMap.set(videoUrlOrKey, resultBlob);
      memoryBlobMap.set(cleanId, resultBlob);
      memoryUrlMap.set(videoUrlOrKey, url);
      memoryUrlMap.set(cleanId, url);
      return url;
    }
  } catch (err) {
    console.warn('Failed to retrieve video from IndexedDB:', err);
  }

  // 3. If it's a regular HTTP/HTTPS URL, return it directly
  if (!videoUrlOrKey.startsWith('idb://')) {
    return videoUrlOrKey;
  }

  return '';
}

export async function deleteVideoBlob(idKey: string): Promise<void> {
  if (!idKey) return;
  const cleanId = idKey.replace('idb://', '');
  memoryBlobMap.delete(idKey);
  memoryBlobMap.delete(cleanId);
  const u1 = memoryUrlMap.get(idKey);
  if (u1) {
    URL.revokeObjectURL(u1);
    memoryUrlMap.delete(idKey);
  }
  const u2 = memoryUrlMap.get(cleanId);
  if (u2) {
    URL.revokeObjectURL(u2);
    memoryUrlMap.delete(cleanId);
  }
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(idKey);
    store.delete(cleanId);
  } catch (err) {
    console.warn('Failed to delete video blob from IndexedDB:', err);
  }
}


