import { Schema, model, Document, Types } from 'mongoose';

interface INotification extends Document {
  title: string;
  message: string;
  user_type: 'User' | 'Vendor' | 'AllUsers' | 'AllVendors';
  user_id?: Types.ObjectId;
}

const notificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  user_type: { type: String, enum: ['User', 'Vendor', 'AllUsers', 'AllVendors'], required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
export { INotification };
