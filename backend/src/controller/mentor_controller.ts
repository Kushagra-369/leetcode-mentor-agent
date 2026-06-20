import { Request, Response } from "express";
import { mentorPrompt } from "../prompts/mentor_prompt";
import { codeReviewPrompt } from "../prompts/codeReviewPrompt";
import { analyzeProblem } from "../services/gemini_service";

export const analyzeMentorProblem = async (
  req: Request,
  res: Response
) => {
  try {
    const { problem } = req.body;

    if (!problem) {
      return res.status(400).json({
        success: false,
        message: "Problem is required",
      });
    }

    const prompt = mentorPrompt(problem);

    const data = await analyzeProblem(prompt);

    const cleaned = data
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Problem Analysis Failed",
    });
  }
};

export const reviewCode = async (
  req: Request,
  res: Response
) => {
  try {
    const { code, problem, problemStatement } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    // Agar problem context hai toh usko include karo
    const prompt = codeReviewPrompt(code, problem, problemStatement);

    const data = await analyzeProblem(prompt);

    const cleaned = data
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Code Review Failed",
    });
  }
};