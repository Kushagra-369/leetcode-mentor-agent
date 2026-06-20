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
  const [result, setResult] = useState<MentorResponse | null>(null);
  const [showHints, setShowHints] = useState({
    hint1: false,
    hint2: false,
    hint3: false,
  });
  const [showSimilar, setShowSimilar] = useState(false);

  const analyzeProblem = async () => {
    if (!problem.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/analyze`, { problem });
      setResult(res.data.data);
      setShowHints({ hint1: false, hint2: false, hint3: false });
      setShowSimilar(false);
    } catch (error) {
      console.log(error);
      alert("Failed to analyze problem");
    } finally {
      setLoading(false);
    }
  };

  const toggleHint = (hintNumber: 1 | 2 | 3) => {
    setShowHints(prev => ({
      ...prev,
      [`hint${hintNumber}`]: !prev[`hint${hintNumber}`],
    }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-blue-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI LeetCode Mentor
          </h1>
          <p className="text-blue-200/80 mt-2 text-lg">
            Learn patterns, get hints, and solve problems without revealing the complete solution.
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
            {/* Pattern Card - Always Visible */}
            <PatternCard
              pattern={result.pattern}
              difficulty={result.difficulty}
              explanation={result.explanation}
              complexity={result.complexity}
            />

            {/* Hints - Progressive Disclosure */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-blue-300">💡 Hints</h2>
              
              {/* Hint 1 */}
              <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 overflow-hidden">
                <button
                  onClick={() => toggleHint(1)}
                  className="w-full p-5 flex items-center justify-between hover:bg-blue-500/10 transition-colors"
                >
                  <span className="text-lg font-medium">Hint Level 1</span>
                  <span className="text-2xl">{showHints.hint1 ? '▼' : '▶'}</span>
                </button>
                {showHints.hint1 && (
                  <div className="p-5 pt-0 border-t border-blue-500/20">
                    <HintCard title="Hint Level 1" hint={result.hint1} />
                  </div>
                )}
              </div>

              {/* Hint 2 */}
              {showHints.hint1 && (
                <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 overflow-hidden">
                  <button
                    onClick={() => toggleHint(2)}
                    className="w-full p-5 flex items-center justify-between hover:bg-blue-500/10 transition-colors"
                  >
                    <span className="text-lg font-medium">Hint Level 2</span>
                    <span className="text-2xl">{showHints.hint2 ? '▼' : '▶'}</span>
                  </button>
                  {showHints.hint2 && (
                    <div className="p-5 pt-0 border-t border-blue-500/20">
                      <HintCard title="Hint Level 2" hint={result.hint2} />
                    </div>
                  )}
                </div>
              )}

              {/* Hint 3 */}
              {showHints.hint2 && (
                <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 overflow-hidden">
                  <button
                    onClick={() => toggleHint(3)}
                    className="w-full p-5 flex items-center justify-between hover:bg-blue-500/10 transition-colors"
                  >
                    <span className="text-lg font-medium">Hint Level 3</span>
                    <span className="text-2xl">{showHints.hint3 ? '▼' : '▶'}</span>
                  </button>
                  {showHints.hint3 && (
                    <div className="p-5 pt-0 border-t border-blue-500/20">
                      <HintCard title="Hint Level 3" hint={result.hint3} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Similar Problems - Show after hints */}
            {showHints.hint3 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowSimilar(!showSimilar)}
                  className="w-full p-5 bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 flex items-center justify-between hover:bg-blue-500/10 transition-colors"
                >
                  <span className="text-lg font-medium">📚 Similar Problems</span>
                  <span className="text-2xl">{showSimilar ? '▼' : '▶'}</span>
                </button>
                {showSimilar && (
                  <div className="mt-4">
                    <SimilarProblems problems={result.similarProblems} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}