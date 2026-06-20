import { useState } from "react";
import axios from "axios";

import { API_URL } from "../../GlobalAPIURL";

import ProblemInput from "../ProblemInput/ProblemInput";
import PatternCard from "../PatternCard/PatternCard";
import HintCard from "../HintCard/HintCard";
import SimilarProblems from "../SimilarProblems/SimilarProblems";

interface MentorResponse {
  pattern: string;
  difficulty: string;
  explanation: string;
  hint1: string;
  hint2: string;
  hint3: string;
  complexity: string;
  similarProblems: string[];
}

export default function Home() {
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<MentorResponse | null>(
    null
  );

  const analyzeProblem = async () => {
    if (!problem.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/analyze`,
        {
          problem,
        }
      );

      setResult(res.data.data);
    } catch (error) {
      console.log(error);
      alert("Failed to analyze problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            AI LeetCode Mentor
          </h1>

          <p className="text-slate-400 mt-2">
            Learn patterns, get hints, and solve
            problems without revealing the complete
            solution.
          </p>
        </div>

        {/* Input Section */}
        <ProblemInput
          problem={problem}
          setProblem={setProblem}
          loading={loading}
          onAnalyze={analyzeProblem}
        />

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            <PatternCard
              pattern={result.pattern}
              difficulty={result.difficulty}
              explanation={result.explanation}
              complexity={result.complexity}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <HintCard
                title="Hint Level 1"
                hint={result.hint1}
              />

              <HintCard
                title="Hint Level 2"
                hint={result.hint2}
              />

              <HintCard
                title="Hint Level 3"
                hint={result.hint3}
              />
            </div>

            <SimilarProblems
              problems={result.similarProblems}
            />
          </div>
        )}
      </div>
    </div>
  );
}