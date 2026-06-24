import { io } from 'socket.io-client';

// Estratégia de ligação:
// - Em desenvolvimento com proxy Vite: ligar sem URL (usa window.location.origin) com path /socket.io
//   O Vite faz proxy de /socket.io → localhost:3002
// - Quando VITE_API_BASE_URL está definido (IP explícito): ligar directamente ao backend
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || undefined;

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  transports: ['polling', 'websocket'], // polling primeiro, depois upgrade — mais estável com proxy
  path: '/socket.io',
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Socket singleton conectado:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('Socket singleton connect_error:', err && err.message);
});

export default socket;
