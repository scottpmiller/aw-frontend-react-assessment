import React, { useState, useEffect } from 'react';
import { StorageModalProps, StorageItem } from '../types';
import { storageAnalyzer } from '../utils/storageAnalyzer';

const StorageModal: React.FC<StorageModalProps> = ({ isOpen, onClose, onStorageCleared }) => {
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [totalUsage, setTotalUsage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStorageData();
    }
  }, [isOpen]);

  const loadStorageData = () => {
    setIsLoading(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      const items = storageAnalyzer.getStorageItems();
      const usage = storageAnalyzer.getTotalUsage();
      
      setStorageItems(items);
      setTotalUsage(usage.usedFormatted);
      setIsLoading(false);
    }, 100);
  };

  const handleDeleteItem = async (key: string) => {
    if (window.confirm(`Are you sure you want to delete "${key}"?`)) {
      const success = storageAnalyzer.deleteItem(key);
      
      if (success) {
        // Reload data
        loadStorageData();
        // Notify parent that storage was cleared
        onStorageCleared();
      } else {
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Browser Storage Manager</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="storage-info">
            <p><strong>Total Storage Used:</strong> {totalUsage}</p>
            <p className="storage-note">
              Showing largest 10 items. Deleting items from other websites may free up space.
            </p>
          </div>

          {isLoading ? (
            <div className="loading-state">Loading storage data...</div>
          ) : (
            <div className="storage-table">
              {storageItems.length === 0 ? (
                <p>No storage items found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Item Key</th>
                      <th>Size</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storageItems.map((item, index) => (
                      <tr key={index}>
                        <td className="item-key" title={item.key}>
                          {item.key.length > 40 ? `${item.key.substring(0, 40)}...` : item.key}
                        </td>
                        <td className="item-size">{item.sizeFormatted}</td>
                        <td className="item-actions">
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteItem(item.key)}
                            aria-label={`Delete ${item.key}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageModal;