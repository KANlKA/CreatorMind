import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  userId?: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  commentId: string;
  authorName: string;
  text: string;
  likes: number;
  publishedAt: Date;
  
  // AI Analysis
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: 'question' | 'praise' | 'request' | 'criticism' | 'confusion';
  topics: string[];
  cluster?: string;
  embedding?: number[];
  
  analyzedAt?: Date;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    commentId: { type: String, required: true, unique: true },
    authorName: String,
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    publishedAt: Date,
    
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    intent: { type: String, enum: ['question', 'praise', 'request', 'criticism', 'confusion'] },
    topics: [String],
    cluster: String,
    embedding: [Number],
    
    analyzedAt: Date,
  },
  { timestamps: true }
);

// Indexes
CommentSchema.index({ videoId: 1, publishedAt: -1 });
CommentSchema.index({ commentId: 1 });
CommentSchema.index({ cluster: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;