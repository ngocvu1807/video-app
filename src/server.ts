import express, { Application } from 'express';
import socketio, { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';

import path from 'path';

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;

  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 3000;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = socketio(this.httpServer);

    this.configureApp();
    this.handleRoutes();
    this.handleSocketConnection();
  }

  // router handler

  handleRoutes() {
    this.app.get('/', (req, res) => {
      res.sendFile('index.html');
    });
  }

  // socket connection

  private handleSocketConnection(): void {
    this.io.on('connection', (socket) => {
      console.log('New WS Connection...');
      console.log(socket.id);

      const existingSocket = this.activeSockets.find(
        (existingSocket) => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit('update-user-list', {
          user: this.activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
          ),
        });

        socket.broadcast.emit('update-user-list', {
          users: [socket.id],
        });

        socket.broadcast.emit('remove-user', {
          socketId: socket.id,
        });

        socket.on('disconnect', () => {
          this.activeSockets = this.activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
          );
        });
      }
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }

  // configure app

  private configureApp(): void {
    this.app.use(express.static(path.join(__dirname, '../public')));
  }
}
