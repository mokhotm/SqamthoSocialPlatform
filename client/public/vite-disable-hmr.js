// This script completely disables Vite HMR to prevent WebSocket errors
console.log('[Vite HMR Disable] Disabling Vite HMR WebSocket connections');

// Override the WebSocket constructor to block Vite HMR connections
const OriginalWebSocket = window.WebSocket;
window.WebSocket = function(url, protocols) {
  // Block Vite HMR WebSocket connections
  if (typeof url === 'string' && url.includes('token=')) {
    console.log('[Vite HMR Disable] Blocking Vite HMR WebSocket connection');
    // Return a dummy WebSocket that never connects
    const fakeSocket = {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      send: () => {},
      close: () => {},
      readyState: 3, // CLOSED
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
      onopen: null,
      onclose: null,
      onerror: null,
      onmessage: null,
      binaryType: 'blob',
      bufferedAmount: 0,
      extensions: '',
      protocol: '',
      url: ''
    };
    
    // Simulate connection closed immediately
    setTimeout(() => {
      if (fakeSocket.onclose) {
        fakeSocket.onclose({ code: 1000, reason: 'HMR disabled', wasClean: true });
      }
    }, 0);
    
    return fakeSocket;
  }
  
  // Allow all other WebSocket connections
  return new OriginalWebSocket(url, protocols);
};

// Suppress Vite error messages about HMR
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args.length > 0) {
    const errorMessage = String(args[0]);
    // Suppress known HMR error messages
    if (errorMessage.includes('WebSocket') && 
        (errorMessage.includes('failed to connect') || 
         errorMessage.includes('closed without opened') ||
         errorMessage.includes('Error during WebSocket handshake'))) {
      return;
    }
  }
  originalConsoleError.apply(this, args);
};
