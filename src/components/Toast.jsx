import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// 🎨 STILI
const styles = `
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
    max-width: 400px;
    width: calc(100% - 40px);
  }

  .toast {
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    border-left: 4px solid;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .toast:hover {
    transform: translateX(-5px);
  }

  .toast-success {
    border-left-color: #10B981;
  }

  .toast-error {
    border-left-color: #DC2626;
  }

  .toast-warning {
    border-left-color: #F59E0B;
  }

  .toast-info {
    border-left-color: #3B82F6;
  }

  .toast-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .toast-content {
    flex: 1;
  }

  .toast-title {
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 4px;
    font-size: 0.95rem;
  }

  .toast-message {
    color: #6B7280;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .toast-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #9CA3AF;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  .toast-close:hover {
    color: #6B7280;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .toast.exit {
    animation: slideOut 0.3s ease-out forwards;
  }

  /* 📱 MOBILE */
  @media (max-width: 768px) {
    .toast-container {
      top: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
      width: auto;
    }

    .toast {
      padding: 14px 16px;
    }
  }
`;

// Toast context
const ToastContext = React.createContext();

/**
 * 🎯 Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove dopo duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast) {
        // Trigger exit animation
        const updatedToasts = prev.map(t =>
          t.id === id ? { ...t, exiting: true } : t
        );
        
        // Rimuovi dopo animazione
        setTimeout(() => {
          setToasts(current => current.filter(t => t.id !== id));
        }, 300);
        
        return updatedToasts;
      }
      return prev;
    });
  };

  const success = (message, duration) => showToast(message, 'success', duration);
  const error = (message, duration) => showToast(message, 'error', duration);
  const warning = (message, duration) => showToast(message, 'warning', duration);
  const info = (message, duration) => showToast(message, 'info', duration);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook per usare toast
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * 🎨 Toast Container Component
 */
const ToastContainer = ({ toasts, onRemove }) => {
  const toastConfig = {
    success: { icon: '✅', className: 'toast-success' },
    error: { icon: '❌', className: 'toast-error' },
    warning: { icon: '⚠️', className: 'toast-warning' },
    info: { icon: 'ℹ️', className: 'toast-info' }
  };

  return createPortal(
    <>
      <style>{styles}</style>
      <div className="toast-container">
        {toasts.map(toast => {
          const config = toastConfig[toast.type] || toastConfig.info;
          return (
            <div
              key={toast.id}
              className={`toast ${config.className} ${toast.exiting ? 'exit' : ''}`}
              onClick={() => onRemove(toast.id)}
            >
              <span className="toast-icon">{config.icon}</span>
              <div className="toast-content">
                <div className="toast-message">{toast.message}</div>
              </div>
              <button
                className="toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(toast.id);
                }}
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </>,
    document.body
  );
};

export default ToastContainer;

