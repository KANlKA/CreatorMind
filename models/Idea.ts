import mongoose, { Schema, Document } from "mongoose";

interface IIdea extends Document {
  userId: string;
  title: string;
  description?: string;
  confidence: number;
  suggestedFormat?: string;
  suggestedLength?: string;
  suggestedTone?: string;
  audienceDemand?: string;
  commentDemand?: string;
  pastPerformance?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ideaSchema = new Schema<IIdea>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    suggestedFormat: String,
    suggestedLength: String,
    suggestedTone: String,
    audienceDemand: String,
    commentDemand: String,
    pastPerformance: String,
  },
  { timestamps: true }
);

// Create compound index for better query performance
ideaSchema.index({ userId: 1, confidence: -1 });

const Idea =
  mongoose.models.Idea || mongoose.model<IIdea>("Idea", ideaSchema);

export default Idea;