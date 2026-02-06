import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  youtubeChannelId?: string;
  youtubeChannelName?: string;
  youtubeSubscriberCount?: number;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  settings: {
    emailEnabled: boolean;  // ← ADD THIS
    emailFrequency: 'weekly' | 'biweekly' | 'monthly';
    emailDay: string;
    emailTime: string;
    timezone: string;
    ideaCount: number;
    preferences?: {
      focusAreas?: string[];
      avoidTopics?: string[];
      preferredFormats?: string[];
    };
  };
  lastSyncedAt?: Date;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    image: String,
    youtubeChannelId: { type: String, sparse: true, unique: true },
    youtubeChannelName: String,
    youtubeSubscriberCount: Number,
    youtubeAccessToken: String,
    youtubeRefreshToken: String,
    settings: {
      emailEnabled: { type: Boolean, default: true },  // ← ADD THIS
      emailFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: 'weekly' },
      emailDay: { type: String, default: 'sunday' },
      emailTime: { type: String, default: '09:00' },
      timezone: { type: String, default: 'America/New_York' },
      ideaCount: { type: Number, default: 5 },
      preferences: {
        focusAreas: [String],
        avoidTopics: [String],
        preferredFormats: [String],
      },
    },
    lastSyncedAt: Date,
    syncStatus: { type: String, enum: ['pending', 'syncing', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;