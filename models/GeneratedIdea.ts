  import mongoose, { Schema, Document, Model } from 'mongoose';

  export interface IGeneratedIdea extends Document {
    userId: mongoose.Types.ObjectId;
    generatedAt: Date;
    weekOf: Date;
    
    ideas: Array<{
      rank: number;
      title: string;
      reasoning: {
        commentDemand: string;
        pastPerformance: string;
        trendingScore: number;
        audienceFit: string;
      };
      evidence: Array<{
        type: 'comment' | 'performance' | 'trend';
        text: string;
        videoId?: mongoose.Types.ObjectId;
        commentId?: mongoose.Types.ObjectId;
      }>;
      predictedEngagement: number;
      confidence: number;
      suggestedStructure: {
        hook: string;
        format: string;
        length: string;
        tone: string;
      };
    }>;
    
    emailSentAt?: Date;
    emailStatus: 'pending' | 'sent' | 'failed';
  }

  const GeneratedIdeaSchema = new Schema<IGeneratedIdea>(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      generatedAt: { type: Date, default: Date.now },
      weekOf: { type: Date, required: true },
      
      ideas: [{
        rank: Number,
        title: String,
        reasoning: {
          commentDemand: String,
          pastPerformance: String,
          trendingScore: Number,
          audienceFit: String,
        },
        evidence: [{
          type: { type: String, enum: ['comment', 'performance', 'trend'] },
          text: String,
          videoId: { type: Schema.Types.ObjectId, ref: 'Video' },
          commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
        }],
        predictedEngagement: Number,
        confidence: Number,
        suggestedStructure: {
          hook: String,
          format: String,
          length: String,
          tone: String,
        },
      }],
      
      emailSentAt: Date,
      emailStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    },
    { timestamps: true }
  );

  // Indexes
  GeneratedIdeaSchema.index({ userId: 1, weekOf: -1 });

  const GeneratedIdea: Model<IGeneratedIdea> =
    mongoose.models.GeneratedIdea || mongoose.model<IGeneratedIdea>('GeneratedIdea', GeneratedIdeaSchema);

  export default GeneratedIdea;