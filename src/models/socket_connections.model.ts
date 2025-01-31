import { Schema, model, Document, Types } from 'mongoose';

export  interface ISocketConnection extends Document {
  socketId: string;
  userId: Types.ObjectId;
  userType?: String | null;
}

const socketConnectionSchema = new Schema({
  socketId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  userType: { type: String, required: false },
});

const SocketConnection = model<ISocketConnection>('SocketConnection', socketConnectionSchema);
export default SocketConnection;
