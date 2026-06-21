// controller/mentor_controller.ts
import { Request, Response } from "express";
import { mentorPrompt } from "../prompts/mentor_prompt";
import { codeReviewPrompt } from "../prompts/codeReviewPrompt";
import { analyzeProblem } from "../services/gemini_service";
import ReviewHistory from "../model/review_history_model";
import User from "../model/user_model";
import MockInterview from "../model/mock_interview_model";
import Contest from "../model/contest_model";

// ============= EXISTING FUNCTIONS =============

export const analyzeMentorProblem = async (req: Request, res: Response) => {
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
    const cleaned = data.replace(/```json/g, "").replace(/```/g, "").trim();
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

export const reviewCode = async (req: Request, res: Response) => {
  try {
    const { code, pattern, problem, userId, difficulty } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    const prompt = codeReviewPrompt(code, pattern || "", problem || "");
    const data = await analyzeProblem(prompt);
    const cleaned = data.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleaned);

    // Create review with proper types
    const review = new ReviewHistory({
      userId: userId || undefined,
      pattern: pattern || "Unknown",
      score: parsedData.score || 0,
      code: code,
      timeComplexity: parsedData.timeComplexity || "",
      spaceComplexity: parsedData.spaceComplexity || "",
      difficulty: difficulty || "Medium",
    });

    await review.save();

    // Update user stats if userId provided
    if (userId) {
      await updateUserStats(userId, parsedData, pattern || "Unknown");
    }

    return res.status(200).json({
      success: true,
      data: parsedData,
      reviewId: review._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Code Review Failed",
    });
  }
};

// ============= HELPER FUNCTIONS =============

async function updateUserStats(userId: string, reviewData: any, pattern: string) {
  const user = await User.findById(userId);
  if (!user) return;

  // Update total reviews and average score
  user.totalReviews = (user.totalReviews || 0) + 1;
  const oldAvg = user.averageScore || 0;
  const newAvg = ((oldAvg * (user.totalReviews - 1)) + (reviewData.score || 0)) / user.totalReviews;
  user.averageScore = newAvg;
  user.problemsSolved = (user.problemsSolved || 0) + 1;

  // Update pattern strengths/weaknesses
  if (reviewData.score >= 80) {
    if (!user.strongPatterns.includes(pattern)) {
      user.strongPatterns.push(pattern);
    }
  } else if (reviewData.score < 60) {
    if (!user.weakPatterns.includes(pattern)) {
      user.weakPatterns.push(pattern);
    }
  }

  // Update strongest/weakest patterns
  const patternStats = await getPatternStats(userId);
  user.strongestPattern = patternStats.strongest || user.strongestPattern || "";
  user.weakestPattern = patternStats.weakest || user.weakestPattern || "";

  // Update streak
  const today = new Date().toDateString();
  const lastActive = user.lastActive ? new Date(user.lastActive).toDateString() : null;

  if (lastActive === today) {
    // Already active today
  } else if (lastActive === new Date(Date.now() - 86400000).toDateString()) {
    user.streak = (user.streak || 0) + 1;
  } else {
    user.streak = 1;
  }
  user.lastActive = new Date();

  // Adaptive learning: update recommendations
  await updateRecommendations(user);

  await user.save();
}

async function getPatternStats(userId: string) {
  const reviews = await ReviewHistory.find({ userId });
  const patternScores: { [key: string]: { total: number; count: number } } = {};

  reviews.forEach((review) => {
    const pattern = review.pattern;

    if (!patternScores[pattern]) {
      patternScores[pattern] = {
        total: 0,
        count: 0,
      };
    }

    patternScores[pattern]!.total += review.score || 0;
    patternScores[pattern]!.count += 1;
  });

  let strongest = "";
  let weakest = "";
  let highestAvg = -Infinity;
  let lowestAvg = Infinity;

  for (const [pattern, stats] of Object.entries(patternScores)) {
    const avg = stats.total / stats.count;
    if (avg > highestAvg) {
      highestAvg = avg;
      strongest = pattern;
    }
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakest = pattern;
    }
  }

  return { strongest, weakest };
}

async function updateRecommendations(user: any) {
  const weakPatterns = user.weakPatterns || [];
  const strongPatterns = user.strongPatterns || [];

  const recommendations: string[] = [...weakPatterns];

  const allPatterns = ["Hash Map", "Two Pointers", "Sliding Window", "Binary Search", "DFS", "BFS", "Dynamic Programming", "Greedy", "Graph", "Heap", "Stack", "Queue", "Backtracking", "Trie", "Union Find"];
  const remaining = allPatterns.filter(p => !recommendations.includes(p) && !strongPatterns.includes(p));

  while (recommendations.length < 3 && remaining.length > 0) {
    const randomIndex = Math.floor(Math.random() * remaining.length);
    const pattern = remaining[randomIndex];
    if (pattern) {
      recommendations.push(pattern);
      remaining.splice(randomIndex, 1);
    }
  }

  user.recommendedPatterns = recommendations.slice(0, 5);
}

// ============= OPTION 1: PROGRESS TRACKING =============

export const getProgressStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const reviews = await ReviewHistory.find({ userId });

    const patternPerformance: Record<
      string,
      {
        total: number;
        count: number;
      }
    > = {};

    reviews.forEach((review) => {
      const pattern = review.pattern;

      if (!patternPerformance[pattern]) {
        patternPerformance[pattern] = {
          total: 0,
          count: 0,
        };
      }

      patternPerformance[pattern]!.total += review.score || 0;
      patternPerformance[pattern]!.count += 1;
    });

    const patternAverages = Object.entries(patternPerformance).map(([pattern, stats]) => ({
      pattern,
      average: parseFloat((stats.total / stats.count).toFixed(1)),
      count: stats.count,
    }));

    // Weekly progress
    const weeklyData = await getWeeklyProgress(
      userId as string
    );
    // Difficulty breakdown
    const difficultyStats = {
      easy: reviews.filter(r => r.difficulty === "Easy").length,
      medium: reviews.filter(r => r.difficulty === "Medium").length,
      hard: reviews.filter(r => r.difficulty === "Hard").length,
    };

    return res.status(200).json({
      success: true,
      data: {
        totalProblems: user.problemsSolved || 0,
        averageScore: (user.averageScore || 0).toFixed(1),
        streak: user.streak || 0,
        patternAverages,
        weeklyProgress: weeklyData,
        difficultyStats,
        strongestPattern: user.strongestPattern || "Not enough data",
        weakestPattern: user.weakestPattern || "Not enough data",
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get progress stats",
    });
  }
};

async function getWeeklyProgress(userId: string) {
  const reviews = await ReviewHistory.find({
    userId,
    reviewedAt: { $gte: new Date(Date.now() - 7 * 86400000) },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekData = days.map((day, index) => {
    const dayReviews = reviews.filter((r) => new Date(r.reviewedAt).getDay() === index);
    return {
      day,
      count: dayReviews.length,
      averageScore: dayReviews.length > 0
        ? parseFloat((dayReviews.reduce((sum, r) => sum + (r.score || 0), 0) / dayReviews.length).toFixed(1))
        : 0,
    };
  });

  return weekData;
}

// ============= OPTION 2: ADAPTIVE LEARNING =============

export const getAdaptiveRecommendations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const reviews = await ReviewHistory.find({ userId });

    const weakAreas = user.weakPatterns || [];
    const strongAreas = user.strongPatterns || [];

    const learningPath: Array<{
      pattern: string;
      priority: string;
      currentScore: number;
      suggestion: string;
    }> = [];

    for (const pattern of weakAreas) {
      const patternReviews = reviews.filter(r => r.pattern === pattern);
      const avgScore = patternReviews.length > 0
        ? patternReviews.reduce((sum, r) => sum + (r.score || 0), 0) / patternReviews.length
        : 0;

      learningPath.push({
        pattern,
        priority: "High",
        currentScore: parseFloat(avgScore.toFixed(1)),
        suggestion: avgScore < 60 ? "Focus on fundamentals" : "Practice more problems",
      });
    }

    const allPatterns = ["Hash Map", "Two Pointers", "Sliding Window", "Binary Search", "DFS", "BFS", "Dynamic Programming", "Greedy", "Graph", "Heap", "Stack", "Queue", "Backtracking", "Trie", "Union Find"];
    const remainingPatterns = allPatterns.filter(p => !weakAreas.includes(p) && !strongAreas.includes(p));

    for (const pattern of remainingPatterns.slice(0, 3)) {
      learningPath.push({
        pattern,
        priority: "Medium",
        currentScore: 0,
        suggestion: "Start with easy problems",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        weakPatterns: weakAreas,
        strongPatterns: strongAreas,
        recommendedPatterns: user.recommendedPatterns || [],
        learningPath,
        nextMilestone: {
          target: 50,
          current: user.problemsSolved || 0,
          remaining: Math.max(0, 50 - (user.problemsSolved || 0)),
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
    });
  }
};

// ============= OPTION 3: MOCK INTERVIEWS =============

export const startMockInterview = async (req: Request, res: Response) => {
  try {
    const { userId, patterns } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const selectedPatterns: string[] = patterns || ["Hash Map", "Two Pointers", "Sliding Window"];
    const questions = selectedPatterns.slice(0, 3).map((pattern: string) =>
      `Solve a ${pattern} problem with optimal approach`
    );

    const mockInterview = new MockInterview({
      userId,
      questions,
      patternsTested: selectedPatterns,
      answers: [],
      scores: [],
      feedback: [],
      overallScore: 0,
    });

    await mockInterview.save();

    return res.status(200).json({
      success: true,
      data: {
        interviewId: mockInterview._id,
        questions,
        patterns: selectedPatterns,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to start mock interview",
    });
  }
};

export const submitMockInterviewAnswer = async (req: Request, res: Response) => {
  try {
    const { interviewId, answer, questionIndex } = req.body;

    if (!interviewId || !answer) {
      return res.status(400).json({
        success: false,
        message: "Interview ID and answer are required",
      });
    }

    const mockInterview = await MockInterview.findById(interviewId);
    if (!mockInterview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const question = mockInterview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index",
      });
    }

    const prompt = `
      You are an interviewer. Evaluate this solution for a DSA problem.
      
      Question: ${question}
      Answer: ${answer}
      
      Return ONLY valid JSON:
      {
        "score": 0-100,
        "feedback": "Short feedback"
      }
    `;

    const data = await analyzeProblem(prompt);
    const cleaned = data.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleaned);

    mockInterview.answers[questionIndex] = answer;
    mockInterview.scores[questionIndex] = parsedData.score || 0;
    mockInterview.feedback[questionIndex] = parsedData.feedback || "";

    // Check if all questions answered
    if (mockInterview.answers.length === mockInterview.questions.length) {
      const validScores = mockInterview.scores.filter(s => s !== undefined && s !== null);
      mockInterview.overallScore = parseFloat(
        (validScores.reduce((sum, s) => sum + s, 0) / validScores.length).toFixed(1)
      );
      mockInterview.completedAt = new Date();

      const user = await User.findById(mockInterview.userId);
      if (user) {
        user.mockInterviewsTaken = (user.mockInterviewsTaken || 0) + 1;
        user.mockInterviewScore = mockInterview.overallScore;
        await user.save();
      }
    }

    await mockInterview.save();

    return res.status(200).json({
      success: true,
      data: {
        score: parsedData.score || 0,
        feedback: parsedData.feedback || "",
        completed: mockInterview.answers.length === mockInterview.questions.length,
        overallScore: mockInterview.overallScore || 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit answer",
    });
  }
};

export const getMockInterviewHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const interviews = await MockInterview.find({ userId }).sort({ completedAt: -1 }).limit(10);

    return res.status(200).json({
      success: true,
      data: interviews.map(i => ({
        id: i._id,
        patterns: i.patternsTested || [],
        score: i.overallScore || 0,
        completed: i.answers.length === i.questions.length,
        date: i.completedAt,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get interview history",
    });
  }
};

// ============= OPTION 4: CONTEST COACH =============

export const startContest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const problems = [
      { title: "Easy Problem", difficulty: "Easy", pattern: "Hash Map" },
      { title: "Medium Problem", difficulty: "Medium", pattern: "Two Pointers" },
      { title: "Hard Problem", difficulty: "Hard", pattern: "Dynamic Programming" },
    ];

    const contest = new Contest({
      userId,
      contestName: `Contest ${new Date().toLocaleDateString()}`,
      problems: problems.map(p => p.title),
      solutions: [],
      scores: [],
      totalScore: 0,
      rank: 0,
    });

    await contest.save();

    return res.status(200).json({
      success: true,
      data: {
        contestId: contest._id,
        problems,
        contestName: contest.contestName,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to start contest",
    });
  }
};

export const submitContestSolution = async (req: Request, res: Response) => {
  try {
    const { contestId, solution, problemIndex } = req.body;

    if (!contestId || !solution) {
      return res.status(400).json({
        success: false,
        message: "Contest ID and solution are required",
      });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    const problem = contest.problems[problemIndex];
    if (!problem) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem index",
      });
    }

    const prompt = `
      Evaluate this solution for a contest problem.
      
      Problem: ${problem}
      Solution: ${solution}
      
      Return ONLY valid JSON:
      {
        "score": 0-100,
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)"
      }
    `;

    const data = await analyzeProblem(prompt);
    const cleaned = data.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleaned);

    contest.solutions[problemIndex] = solution;
    contest.scores[problemIndex] = parsedData.score || 0;
    contest.totalScore = contest.scores.reduce((sum, s) => sum + (s || 0), 0);

    // Check if all problems solved
    if (contest.solutions.length === contest.problems.length) {
      contest.completedAt = new Date();

      const user = await User.findById(contest.userId);
      if (user) {
        user.contestsParticipated = (user.contestsParticipated || 0) + 1;
        const oldRating = user.contestRating || 1200;
        user.contestRating = Math.round((oldRating * (user.contestsParticipated - 1) + contest.totalScore) / user.contestsParticipated);
        await user.save();
      }
    }

    await contest.save();

    return res.status(200).json({
      success: true,
      data: {
        score: parsedData.score || 0,
        timeComplexity: parsedData.timeComplexity || "",
        spaceComplexity: parsedData.spaceComplexity || "",
        totalScore: contest.totalScore || 0,
        completed: contest.solutions.length === contest.problems.length,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit solution",
    });
  }
};

export const getContestHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const contests = await Contest.find({ userId }).sort({ participatedAt: -1 }).limit(10);

    return res.status(200).json({
      success: true,
      data: contests.map(c => ({
        id: c._id,
        name: c.contestName,
        totalScore: c.totalScore || 0,
        rank: c.rank || 0,
        completed: c.solutions.length === c.problems.length,
        date: c.participatedAt,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get contest history",
    });
  }
};

export const getContestLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("name email contestRating contestsParticipated")
      .sort({ contestRating: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: users.map((u, index) => ({
        rank: index + 1,
        name: u.name,
        rating: u.contestRating || 1200,
        contests: u.contestsParticipated || 0,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get leaderboard",
    });
  }
};