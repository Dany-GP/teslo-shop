import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;


  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }



  async handleConnection(client: Socket) {
   
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    console.log(token);
    

    try {

      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);

    } catch (error) {
      console.log(error);
      
      client.disconnect();
      return;
    }

    
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClientsName());
    console.log({ conectados: this.messagesWsService.getConnectedClients() });


  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClientsName());
    console.log({ conectados: this.messagesWsService.getConnectedClients() });
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {

    console.log(client.id, payload);


    // this.wss.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message
    // })  

    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message
    // })

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserBySocketId(client.id),
      message: payload.message
    })



  }




}
