import mongoose, { Schema } from "mongoose";

interface INotificationToken {
  user_id: mongoose.Types.ObjectId;
  user_type: "Customer" | "Vendor" ;
  token: string;
}

const notificationTokenSchema: Schema<INotificationToken> = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  user_type: {
    type: String,
    enum: ["Customer", "Vendor"],
    required: true
  },
  token: {
    type: String,
    required: true
  }
});

export default mongoose.model<INotificationToken>("NotificationToken", notificationTokenSchema);
