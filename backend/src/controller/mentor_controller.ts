import { Request, Response } from "express";
import { mentorPrompt } from "../prompts/mentor_prompt";
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

    let cleaned = data
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
      message: "Analysis Failed",
    });
  }
};