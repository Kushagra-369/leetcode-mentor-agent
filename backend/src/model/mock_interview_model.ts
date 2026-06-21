// models/mock_interview_model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMockInterview extends Document {
  userId: mongoose.Types.ObjectId;
  questions: string[];
  answers: string[];
  scores: number[];
  feedback: string[];
  overallScore: number;
  patternsTested: string[];
  completedAt: Date;
}

const mockInterviewSchema = new Schema<IMockInterview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: {
    type: [String],
    required: true,
  },
  answers: {
    type: [String],
    default: [],
  },
  scores: {
    type: [Number],
    default: [],
  },
  feedback: {
    type: [String],
    default: [],
  },
  overallScore: {
    type: Number,
    default: 0,
  },
  patternsTested: {
    type: [String],
    default: [],
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IMockInterview>("MockInterview", mockInterviewSchema);