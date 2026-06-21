// models/user_model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  totalReviews: number;
  averageScore: number;
  strongestPattern: string;
  weakestPattern: string;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  lastActive: Date;
  weakPatterns: string[];
  strongPatterns: string[];
  recommendedPatterns: string[];
  mockInterviewsTaken: number;
  mockInterviewScore: number;
  contestsParticipated: number;
  contestRating: number;
  contestRank: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    strongestPattern: {
      type: String,
      default: "",
    },
    weakestPattern: {
      type: String,
      default: "",
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    easySolved: {
      type: Number,
      default: 0,
    },
    mediumSolved: {
      type: Number,
      default: 0,
    },
    hardSolved: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    weakPatterns: {
      type: [String],
      default: [],
    },
    strongPatterns: {
      type: [String],
      default: [],
    },
    recommendedPatterns: {
      type: [String],
      default: [],
    },
    mockInterviewsTaken: {
      type: Number,
      default: 0,
    },
    mockInterviewScore: {
      type: Number,
      default: 0,
    },
    contestsParticipated: {
      type: Number,
      default: 0,
    },
    contestRating: {
      type: Number,
      default: 1200,
    },
    contestRank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);