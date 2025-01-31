import { Socket as SocketIOSocket } from "socket.io";

export interface AuthSocket extends SocketIOSocket {
  userId?: string;
}

export default AuthSocket;
