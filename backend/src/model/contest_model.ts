// models/contest_model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IContest extends Document {
  userId: mongoose.Types.ObjectId;
  contestName: string;
  problems: string[];
  solutions: string[];
  scores: number[];
  totalScore: number;
  rank: number;
  participatedAt: Date;
  completedAt: Date;
}

const contestSchema = new Schema<IContest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contestName: {
    type: String,
    required: true,
  },
  problems: {
    type: [String],
    required: true,
  },
  solutions: {
    type: [String],
    default: [],
  },
  scores: {
    type: [Number],
    default: [],
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  participatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IContest>("Contest", contestSchema);