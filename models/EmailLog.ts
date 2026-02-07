import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailLog extends Document {
  userId: mongoose.Types.ObjectId;
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  mailjetMessageId?: number;
  ideaCount: number;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientEmail: { type: String, required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
      default: 'sent',
    },
    mailjetMessageId: Number,
    ideaCount: { type: Number, default: 5 },
    sentAt: { type: Date, default: Date.now },
    deliveredAt: Date,
    openedAt: Date,
    failureReason: String,
  },
  { timestamps: true }
);

// Indexes
EmailLogSchema.index({ userId: 1, sentAt: -1 });
EmailLogSchema.index({ recipientEmail: 1, sentAt: -1 });
EmailLogSchema.index({ mailjetMessageId: 1 });

const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog || mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);

export default EmailLog;