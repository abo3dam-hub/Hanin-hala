import { FastifyInstance } from 'fastify';

export async function wsHandler(server: FastifyInstance) {
  server.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        // Broadcast to all clients in this simple implementation
        server.websocketServer.clients.forEach((client: any) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'broadcast', payload: data }));
          }
        });
      } catch (e) {
        connection.socket.send(JSON.stringify({ type: 'error', message: 'invalid message' }));
      }
    });
    connection.socket.send(JSON.stringify({ type: 'connected', message: 'متصل' }));
  });
}
