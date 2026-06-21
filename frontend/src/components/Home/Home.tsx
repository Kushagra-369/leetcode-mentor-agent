// app/page.tsx or pages/index.tsx
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../GlobalAPIURL";

// Import new components
import ProgressDashboard from "../ProgressDashboard/ProgressDashboard";
import AdaptiveLearning from "../AdaptiveLearning/AdaptiveLearning";
import MockInterview from "../MockInterview/MockInterview";
import ContestCoach from "../ContestCoach/ContestCoach";

// Types
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

interface CodeReviewResponse {
  score: number;
  correctness: string;
  bugs: string[];
  optimizations: string[];
  edgeCases: string[];
  timeComplexity: string;
  spaceComplexity: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"analyze" | "progress" | "adaptive" | "mock" | "contest">("analyze");
  const [problem, setProblem] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [result, setResult] = useState<MentorResponse | null>(null);
  const [codeResult, setCodeResult] = useState<CodeReviewResponse | null>(null);
  const [showHints, setShowHints] = useState({
    hint1: false,
    hint2: false,
    hint3: false,
  });
  const [showSimilar, setShowSimilar] = useState(false);

  // Mock user ID - replace with actual auth
  const userId = "user_123";

  const analyzeProblem = async () => {
    if (!problem.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/analyze-problem`, { problem });
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

  const reviewCode = async () => {
    if (!code.trim()) return;

    try {
      setCodeLoading(true);
      const payload = {
        code,
        pattern: result?.pattern || "",
        problem: problem || "",
        userId,
        difficulty: result?.difficulty || "Medium",
      };
      const res = await axios.post(`${API_URL}/review-code`, payload);
      setCodeResult(res.data.data);
    } catch (error) {
      console.log(error);
      alert("Failed to review code");
    } finally {
      setCodeLoading(false);
    }
  };

  const toggleHint = (hintNumber: 1 | 2 | 3) => {
    setShowHints(prev => ({
      ...prev,
      [`hint${hintNumber}`]: !prev[`hint${hintNumber}`],
    }));
  };

  const tabs = [
    { id: "analyze", label: "📊 Analyze", icon: "🔍" },
    { id: "progress", label: "📈 Progress", icon: "📊" },
    { id: "adaptive", label: "🧠 Adaptive", icon: "🎯" },
    { id: "mock", label: "🎤 Mock Interview", icon: "💼" },
    { id: "contest", label: "🏆 Contest", icon: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050510] via-[#0a0a2e] to-[#0d1b3e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI LeetCode Mentor
          </h1>
          <p className="text-blue-200/80 mt-2 text-lg">
            Analyze problems, track progress, practice interviews, and compete!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-linear-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-gray-800/50 hover:bg-gray-700/50 border border-blue-500/20"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Analyze Tab */}
          {activeTab === "analyze" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Problem Analysis */}
              <div>
                <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                  <h2 className="text-xl font-semibold mb-3 text-blue-300">📝 Problem Statement</h2>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Paste your LeetCode problem here..."
                    className="w-full h-40 bg-black/50 rounded-lg p-4 outline-none resize-none border border-blue-500/30 focus:border-blue-400 transition-all duration-300 placeholder:text-gray-500 text-white"
                  />
                  <button
                    onClick={analyzeProblem}
                    disabled={loading}
                    className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      loading
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      "🚀 Analyze Problem"
                    )}
                  </button>
                </div>

                {result && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-5 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                      <h2 className="text-xl font-semibold mb-3 text-blue-300">🎯 Pattern</h2>
                      <div className="flex gap-3 flex-wrap mb-3">
                        <span className="bg-linear-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-blue-500/30">
                          {result.pattern}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                          result.difficulty === "Easy"
                            ? "bg-linear-to-r from-green-500 to-emerald-500 shadow-green-500/30"
                            : result.difficulty === "Medium"
                            ? "bg-linear-to-r from-yellow-500 to-orange-500 shadow-yellow-500/30"
                            : "bg-linear-to-r from-red-500 to-rose-500 shadow-red-500/30"
                        }`}>
                          {result.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{result.explanation}</p>
                      <p className="text-gray-300 mt-2">
                        <strong className="text-blue-300">Complexity:</strong> {result.complexity}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold text-blue-300">💡 Hints</h2>
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 overflow-hidden">
                          <button
                            onClick={() => toggleHint(num as 1 | 2 | 3)}
                            className="w-full p-4 flex items-center justify-between hover:bg-blue-500/10 transition-colors"
                          >
                            <span className="font-medium">Hint Level {num}</span>
                            <span className="text-xl">{showHints[`hint${num}` as keyof typeof showHints] ? '▼' : '▶'}</span>
                          </button>
                          {showHints[`hint${num}` as keyof typeof showHints] && (
                            <div className="p-4 pt-0 border-t border-blue-500/20">
                              <p className="text-gray-300">{result[`hint${num}` as keyof MentorResponse]}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {showHints.hint3 && (
                      <div>
                        <button
                          onClick={() => setShowSimilar(!showSimilar)}
                          className="w-full p-4 bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10 flex items-center justify-between hover:bg-blue-500/10 transition-colors"
                        >
                          <span className="font-medium">📚 Similar Problems</span>
                          <span className="text-xl">{showSimilar ? '▼' : '▶'}</span>
                        </button>
                        {showSimilar && (
                          <div className="mt-3 bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-4 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                            <ul className="space-y-2">
                              {result.similarProblems.map((problem, index) => (
                                <li key={index} className="bg-black/30 p-3 rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-all text-gray-300">
                                  {problem}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Code Review */}
              <div>
                <div className="bg-linear-to-br from-gray-900/90 to-purple-950/90 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-purple-300">💻 Your Code</h2>
                    {result && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                        Context: {result.pattern}
                      </span>
                    )}
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code solution here..."
                    className="w-full h-48 bg-black/50 rounded-lg p-4 outline-none resize-none border border-purple-500/30 focus:border-purple-400 transition-all duration-300 placeholder:text-gray-500 text-white font-mono text-sm"
                  />
                  <button
                    onClick={reviewCode}
                    disabled={codeLoading || !code.trim()}
                    className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      codeLoading || !code.trim()
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                    }`}
                  >
                    {codeLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Reviewing...
                      </span>
                    ) : (
                      "🔍 Review Code"
                    )}
                  </button>
                </div>

                {codeResult && (
                  <div className="mt-6 space-y-4 animate-fadeIn">
                    <div className="bg-linear-to-br from-gray-900/90 to-purple-950/90 backdrop-blur-sm p-5 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold text-purple-300">📊 Score</h2>
                        <span className={`text-3xl font-bold ${
                          codeResult.score >= 8 ? "text-green-400" :
                          codeResult.score >= 6 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {codeResult.score}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-1000 ${
                            codeResult.score >= 8 ? "bg-green-500" :
                            codeResult.score >= 6 ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${codeResult.score * 10}%` }}
                        />
                      </div>
                      <p className="text-gray-300 mt-3">{codeResult.correctness}</p>
                    </div>

                    {codeResult.bugs.length > 0 && (
                      <div className="bg-linear-to-br from-gray-900/90 to-red-950/30 backdrop-blur-sm p-5 rounded-2xl border border-red-500/30 shadow-lg shadow-red-500/10">
                        <h2 className="text-xl font-semibold mb-3 text-red-300">🐛 Bugs</h2>
                        <ul className="space-y-2">
                          {codeResult.bugs.map((bug, index) => (
                            <li key={index} className="bg-black/30 p-3 rounded-lg border border-red-500/20 text-gray-300">
                              {bug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {codeResult.optimizations.length > 0 && (
                      <div className="bg-linear-to-br from-gray-900/90 to-blue-950/30 backdrop-blur-sm p-5 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                        <h2 className="text-xl font-semibold mb-3 text-blue-300">🚀 Optimizations</h2>
                        <ul className="space-y-2">
                          {codeResult.optimizations.map((opt, index) => (
                            <li key={index} className="bg-black/30 p-3 rounded-lg border border-blue-500/20 text-gray-300">
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {codeResult.edgeCases.length > 0 && (
                      <div className="bg-linear-to-br from-gray-900/90 to-yellow-950/30 backdrop-blur-sm p-5 rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                        <h2 className="text-xl font-semibold mb-3 text-yellow-300">⚠️ Edge Cases</h2>
                        <ul className="space-y-2">
                          {codeResult.edgeCases.map((edge, index) => (
                            <li key={index} className="bg-black/30 p-3 rounded-lg border border-yellow-500/20 text-gray-300">
                              {edge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-linear-to-br from-gray-900/90 to-green-950/30 backdrop-blur-sm p-5 rounded-2xl border border-green-500/30 shadow-lg shadow-green-500/10">
                        <h2 className="text-sm font-semibold text-green-300 mb-2">⏱️ Time</h2>
                        <p className="text-gray-300 font-mono text-sm">{codeResult.timeComplexity}</p>
                      </div>
                      <div className="bg-linear-to-br from-gray-900/90 to-purple-950/30 backdrop-blur-sm p-5 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
                        <h2 className="text-sm font-semibold text-purple-300 mb-2">💾 Space</h2>
                        <p className="text-gray-300 font-mono text-sm">{codeResult.spaceComplexity}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && <ProgressDashboard userId={userId} />}

          {/* Adaptive Learning Tab */}
          {activeTab === "adaptive" && <AdaptiveLearning userId={userId} />}

          {/* Mock Interview Tab */}
          {activeTab === "mock" && <MockInterview userId={userId} />}

          {/* Contest Tab */}
          {activeTab === "contest" && <ContestCoach userId={userId} />}
        </div>
      </div>
    </div>
  );
}