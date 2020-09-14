import { Server } from './server';

const server = new Server();

server.listen((port) => {
  console.log(`Server's listening on http://localhost:${port}`);
});
