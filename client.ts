import io, { Manager } from 'socket.io-client';

console.log('Running...');

const manager = new Manager('http://://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true,
});

const socket = manager.socket('/');

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('chat', 'Hello NestJS');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
});

socket.on('chat', (message) => {
  console.log('Message from server:', message);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
