// Mock Zustand implementation
const create = <T extends object>(
  createState: (
    set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void,
    get: () => T
  ) => T
) => {
  let state: T;
  const listeners = new Set<() => void>();

  const setState = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => {
    const nextState = typeof partial === 'function'
      ? (partial as (state: T) => T | Partial<T>)(state)
      : partial;
    state = { ...state, ...nextState };
    listeners.forEach(listener => listener());
  };

  const getState = () => state;

  const store = createState(setState, getState);
  state = store;

  const useStore = () => store;
  useStore.getState = getState;
  useStore.setState = setState;

  return useStore;
};

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

interface WebSocketStore {
  socket: WebSocket | null;
  status: WebSocketStatus;
  reconnectAttempts: number;
  lastPingTime: number | null;
  connect: (url: string, onMessage: (data: any) => void) => void;
  disconnect: () => void;
  resetReconnectAttempts: () => void;
  sendMessage: (data: any) => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL = 30000; // 30 seconds
const PONG_TIMEOUT = 10000; // 10 seconds
const RECONNECT_DELAY = 1000; // Base delay of 1 second

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  status: 'disconnected',
  reconnectAttempts: 0,
  lastPingTime: null,

  connect: (url: string, onMessage: (data: any) => void) => {
    const store = get();
    if (store.socket?.readyState === WebSocket.OPEN) return;
    
    try {
      const socket = new WebSocket(url);
      let pingInterval: number;
      let pongTimeout: number;
      
      const startPingInterval = () => {
        pingInterval = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
            set({ lastPingTime: Date.now() });
            
            // Set pong timeout
            pongTimeout = window.setTimeout(() => {
              console.warn('Pong not received, reconnecting...');
              socket.close();
              store.connect(url, onMessage);
            }, PONG_TIMEOUT);
          }
        }, PING_INTERVAL);
      };

      socket.onopen = () => {
        console.log('WebSocket connected');
        set({
          socket,
          status: 'connected',
          reconnectAttempts: 0
        });
        startPingInterval();
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'pong') {
          window.clearTimeout(pongTimeout);
          return;
        }
        
        onMessage(data);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        window.clearInterval(pingInterval);
        window.clearTimeout(pongTimeout);
        set({ socket: null, status: 'disconnected' });
        
        // Implement exponential backoff for reconnection
        const reconnectAttempts = get().reconnectAttempts;
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          window.setTimeout(() => {
            set({ reconnectAttempts: reconnectAttempts + 1 });
            store.connect(url, onMessage);
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };

      set({ socket, status: 'connecting' });
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      set({ status: 'disconnected' });
    }
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.close();
      set({ socket: null, status: 'disconnected' });
    }
  },

  resetReconnectAttempts: () => {
    set({ reconnectAttempts: 0 });
  },

  sendMessage: (data: any) => {
    const socket = get().socket;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  },
}));

// Removed the following functions as they were not being used in the provided code
// const handleWebSocketMessage = (data: any) => {
//   switch (data.type) {
//     case 'status_update':
//       // Handle status updates
//       break;
//     case 'incident_update':
//       // Handle incident updates
//       break;
//     case 'maintenance_update':
//       // Handle maintenance updates
//       break;
//     default:
//       console.warn('Unknown message type:', data.type);
//   }
// };

// export const sendWebSocketMessage = (type: string, payload: any) => {
//   const { socket, status } = useWebSocket.getState();
//   if (status === 'connected' && socket) {
//     try {
//       // Validate payload before sending
//       if (payload && typeof payload === 'object') {
//         socket.send(JSON.stringify({ type, payload }));
//       } else {
//         throw new Error('Invalid payload format');
//       }
//     } catch (error) {
//       console.error('Error sending WebSocket message:', error);
//     }
//   }
// };
