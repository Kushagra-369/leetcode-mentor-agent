import express from "express";
import { analyzeMentorProblem } from "../controller/mentor_controller";

const router = express.Router();

router.post("/analyze", analyzeMentorProblem);

export default router;