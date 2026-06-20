import express from "express";

import {
  analyzeMentorProblem,
  reviewCode,
} from "../controller/mentor_controller";

console.log("ROUTES FILE LOADED");
const router = express.Router();

router.post("/analyze-problem", analyzeMentorProblem);
router.post(
  "/review-code",
  reviewCode
);

export default router;