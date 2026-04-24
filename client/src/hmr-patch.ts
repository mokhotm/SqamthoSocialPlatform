/**
 * This file contains patches to fix HMR WebSocket issues in development mode
 */

// Patch WebSocket to fix HMR connection issues
function patchWebSocket() {
  // Store the original WebSocket constructor
  const OriginalWebSocket = window.WebSocket;

  // Create a wrapper function to intercept WebSocket connections
  const PatchedWebSocketConstructor: any = function(this: WebSocket, url: string | URL, protocols?: string | string[]) {
    let finalUrl = url;
    // If this is a Vite HMR WebSocket connection (contains token parameter)
    if (typeof url === 'string' && url.includes('token=')) {
      // Intercept it and redirect to our custom HMR endpoint
      finalUrl = url.replace('ws://localhost:5000/', 'ws://localhost:5000/_hmr/');
      console.log('[HMR Patch] Redirecting WebSocket connection to:', finalUrl);
    }
    
    // Use the original constructor
    return new OriginalWebSocket(finalUrl, protocols);
  };

  // Copy static properties
  PatchedWebSocketConstructor.prototype = OriginalWebSocket.prototype;
  PatchedWebSocketConstructor.CONNECTING = OriginalWebSocket.CONNECTING;
  PatchedWebSocketConstructor.OPEN = OriginalWebSocket.OPEN;
  PatchedWebSocketConstructor.CLOSING = OriginalWebSocket.CLOSING;
  PatchedWebSocketConstructor.CLOSED = OriginalWebSocket.CLOSED;

  // Replace the WebSocket constructor
  window.WebSocket = PatchedWebSocketConstructor as unknown as typeof WebSocket;
}

// Apply the patch
patchWebSocket();

// Suppress specific console errors related to WebSocket
function suppressWebSocketErrors() {
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    // Check if this is a WebSocket error we want to suppress
    if (args.length > 0) {
      const errorString = String(args[0]);
      if (errorString.includes('WebSocket closed without opened') || 
          errorString.includes('WebSocket connection to') ||
          errorString.includes('failed to connect to websocket')) {
        // Suppress the error in development
        return;
      }
    }
    
    // Forward all other errors to the original console.error
    originalConsoleError.apply(console, args);
  };
}

// Apply error suppression
suppressWebSocketErrors();

export {};
