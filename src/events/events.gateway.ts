import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<string, boolean>();

  async handleConnection(client: Socket) {
    const userId = client.id;

    this.onlineUsers.set(userId, true);
    this.notifyRelevantClients('userOnline', userId);
  }

  async handleDisconnect(client: Socket) {
    const userId = client.id;

    this.handleUnintentionalDisconnect(userId);
  }

  @SubscribeMessage('setUserOnline')
  async setUserOnline(@MessageBody() data: { userId: string }) {
    this.onlineUsers.set(data.userId, true);
    this.notifyRelevantClients('userOnline', data.userId);
  }

  @SubscribeMessage('setUserOffline')
  async setUserOffline(@MessageBody() data: { userId: string }) {
    this.onlineUsers.set(data.userId, false);
    this.notifyRelevantClients('userOffline', data.userId);
  }

  private notifyRelevantClients(event: string, userId: string) {
    this.server.emit(event, userId);
  }

  private handleUnintentionalDisconnect(userId: string) {
    setTimeout(() => {
      if (!this.onlineUsers.get(userId)) {
        this.server.emit('userOffline', userId);
      }
    }, 5000);
  }
}
