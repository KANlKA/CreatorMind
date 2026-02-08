import mongoose, { Schema, Document } from "mongoose";

interface EmailSettings {
  enabled: boolean;
  frequency: "weekly" | "biweekly" | "monthly";
  day: string;
  time: string;
  timezone: string;
  ideaCount: number;
  preferences?: {
    focusAreas: string[];
    avoidTopics: string[];
    preferredFormats: string[];
  };
}

interface EmailLog {
  sentAt: Date;
  ideaCount: number;
  status: "sent" | "delivered" | "bounced" | "failed";
}

interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  emailSettings?: EmailSettings;
  emailHistory?: EmailLog[];
  youtubeConnected: boolean;
  youtubeChannelId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    image: String,
    youtubeConnected: {
      type: Boolean,
      default: false,
    },
    youtubeChannelId: String,
    emailSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ["weekly", "biweekly", "monthly"],
        default: "weekly",
      },
      day: {
        type: String,
        enum: [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
        default: "monday",
      },
      time: {
        type: String,
        default: "09:00",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      ideaCount: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
      },
      preferences: {
        focusAreas: [String],
        avoidTopics: [String],
        preferredFormats: [String],
      },
    },
    emailHistory: [
      {
        sentAt: Date,
        ideaCount: Number,
        status: {
          type: String,
          enum: ["sent", "delivered", "bounced", "failed"],
          default: "sent",
        },
      },
    ],
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;