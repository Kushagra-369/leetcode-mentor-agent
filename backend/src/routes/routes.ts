// routes/routes.ts
import express from "express";
import {
  analyzeMentorProblem,
  reviewCode,
  getProgressStats,
  getAdaptiveRecommendations,
  startMockInterview,
  submitMockInterviewAnswer,
  getMockInterviewHistory,
  startContest,
  submitContestSolution,
  getContestHistory,
  getContestLeaderboard,
} from "../controller/mentor_controller";

console.log("ROUTES FILE LOADED");
const router = express.Router();

// Existing routes
router.post("/analyze-problem", analyzeMentorProblem);
router.post("/review-code", reviewCode);

// Option 1: Progress Tracking
router.get("/progress/:userId", getProgressStats);

// Option 2: Adaptive Learning
router.get("/recommendations/:userId", getAdaptiveRecommendations);

// Option 3: Mock Interviews
router.post("/mock-interview/start", startMockInterview);
router.post("/mock-interview/submit", submitMockInterviewAnswer);
router.get("/mock-interview/history/:userId", getMockInterviewHistory);

// Option 4: Contest Coach
router.post("/contest/start", startContest);
router.post("/contest/submit", submitContestSolution);
router.get("/contest/history/:userId", getContestHistory);
router.get("/contest/leaderboard", getContestLeaderboard);

export default router;