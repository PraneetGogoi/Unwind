import { ydoc } from './db';
import { WebrtcProvider } from 'y-webrtc';

let provider: WebrtcProvider | null = null;

export function startSync(roomName: string, password?: string) {
  if (typeof window === 'undefined') return null;
  
  if (provider) {
    provider.destroy();
  }
  
  // Connect to public signaling servers, but the data is encrypted via the password
  provider = new WebrtcProvider(roomName, ydoc, {
    password: password || undefined,
    signaling: [
      'wss://signaling.yjs.dev', 
      'wss://y-webrtc-signaling-eu.herokuapp.com',
      'wss://y-webrtc-signaling-us.herokuapp.com'
    ]
  });

  return provider;
}

export function stopSync() {
  if (provider) {
    provider.destroy();
    provider = null;
  }
}

export function getSyncProvider() {
  return provider;
}
