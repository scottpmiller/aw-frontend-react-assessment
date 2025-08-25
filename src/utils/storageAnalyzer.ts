import { StorageItem } from '../types';

export const storageAnalyzer = {
  // Get all localStorage items with their sizes
  getStorageItems(): StorageItem[] {
    const items: StorageItem[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = new Blob([key + value]).size;
        
        items.push({
          key,
          size,
          sizeFormatted: this.formatBytes(size)
        });
      }
    }
    
    // Sort by size (largest first) and return top 10
    return items
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
  },

  // Format bytes into human readable format
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get total localStorage usage
  getTotalUsage(): { used: number, usedFormatted: string } {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += new Blob([key + value]).size;
      }
    }
    
    return {
      used: totalSize,
      usedFormatted: this.formatBytes(totalSize)
    };
  },

  // Check if localStorage is likely full by testing a write
  isStorageFull(): boolean {
    try {
      const testKey = '__storage_test__';
      const testValue = 'test';
      localStorage.setItem(testKey, testValue);
      localStorage.removeItem(testKey);
      return false;
    } catch (e) {
      return true;
    }
  },

  // Delete a localStorage item safely
  deleteItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Failed to delete localStorage item:', e);
      return false;
    }
  }
};