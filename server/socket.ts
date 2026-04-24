import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// Socket event types
interface ServerToClientEvents {
  messageReceived: (data: {
    messageId: number;
    conversationId: number;
    senderId: number;
    content: string;
    timestamp: Date;
  }) => void;
  conversationCreated: (data: {
    conversationId: number;
    participantIds: number[];
  }) => void;
}

interface ClientToServerEvents {
  joinRoom: (conversationId: number) => void;
  leaveRoom: (conversationId: number) => void;
}

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected to socket:', socket.id);

    socket.on('joinRoom', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation:${conversationId}`);
    });

    socket.on('leaveRoom', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} left conversation:${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id);
    });
  });

  return io;
}

export { io };
