const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

export const safeSetItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    const size = new Blob([serializedValue]).size;
    
    if (size > MAX_STORAGE_SIZE) {
      console.warn(`Storage item ${key} exceeds size limit`);
      return false;
    }
    
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

export const safeGetItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Storage error:', error);
    return null;
  }
}; 