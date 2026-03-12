import { io } from 'socket.io-client';

// Conexão singleton para Socket.IO — criada uma vez no carregamento do bundle
const SOCKET_URL = 'http://localhost:3000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
  transports: ['websocket'] // força websocket (evita xhr polling que está retornando 404)
});

socket.on('connect', () => {
  console.log('Socket singleton conectado:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('Socket singleton connect_error:', err && err.message);
});

export default socket;
