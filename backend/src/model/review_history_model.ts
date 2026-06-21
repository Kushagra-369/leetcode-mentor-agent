// models/review_history_model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReviewHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  pattern: string;
  score: number;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
  difficulty: string;
  reviewedAt: Date;
}

const reviewHistorySchema = new Schema<IReviewHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  pattern: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  timeComplexity: {
    type: String,
    default: "",
  },
  spaceComplexity: {
    type: String,
    default: "",
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IReviewHistory>("ReviewHistory", reviewHistorySchema);