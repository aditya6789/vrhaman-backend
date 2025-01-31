import mongoose, { Schema, Document } from 'mongoose';

interface IUserPhoto extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  photoUrl: string;
  uploadedAt: Date;
}

const UserPhotoSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photoUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const UserPhoto = mongoose.model<IUserPhoto>('UserPhoto', UserPhotoSchema);
export default UserPhoto;
