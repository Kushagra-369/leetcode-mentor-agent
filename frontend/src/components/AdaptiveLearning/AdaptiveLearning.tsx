// components/AdaptiveLearning.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../GlobalAPIURL";

interface RecommendationData {
  weakPatterns: string[];
  strongPatterns: string[];
  recommendedPatterns: string[];
  learningPath: Array<{
    pattern: string;
    priority: string;
    currentScore: number;
    suggestion: string;
  }>;
  nextMilestone: {
    target: number;
    current: number;
    remaining: number;
  };
}

export default function AdaptiveLearning({ userId }: { userId: string }) {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`${API_URL}/recommendations/${userId}`);
      setData(res.data.data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-4">🧠</p>
        <p>Complete some reviews to get personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Next Milestone */}
      <div className="bg-linear-to-br from-gray-900/90 to-purple-950/90 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30">
        <h3 className="text-xl font-semibold text-purple-300 mb-4">🎯 Next Milestone</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">
            {data.nextMilestone.current} / {data.nextMilestone.target} problems
          </span>
          <span className="text-purple-300 font-semibold">
            {data.nextMilestone.remaining} remaining
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div
            className="h-2.5 rounded-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${(data.nextMilestone.current / data.nextMilestone.target) * 100}%` }}
          />
        </div>
      </div>

      {/* Pattern Strengths/Weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-gray-900/90 to-green-950/90 backdrop-blur-sm p-5 rounded-2xl border border-green-500/30">
          <h4 className="text-green-300 text-sm font-semibold mb-2">✅ Strong Patterns</h4>
          {data.strongPatterns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.strongPatterns.map((p) => (
                <span key={p} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Complete more reviews</p>
          )}
        </div>
        <div className="bg-linear-to-br from-gray-900/90 to-red-950/90 backdrop-blur-sm p-5 rounded-2xl border border-red-500/30">
          <h4 className="text-red-300 text-sm font-semibold mb-2">⚠️ Weak Patterns</h4>
          {data.weakPatterns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.weakPatterns.map((p) => (
                <span key={p} className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No weak patterns identified</p>
          )}
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
        <h3 className="text-xl font-semibold text-blue-300 mb-4">📚 Personalized Learning Path</h3>
        <div className="space-y-4">
          {data.learningPath.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                item.priority === "High"
                  ? "bg-red-950/30 border-red-500/30"
                  : "bg-blue-950/30 border-blue-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">{item.pattern}</span>
                  <span className={`ml-3 text-xs px-2 py-1 rounded ${
                    item.priority === "High"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}>
                    {item.priority} Priority
                  </span>
                </div>
                {item.currentScore > 0 && (
                  <span className="text-sm text-gray-300">Score: {item.currentScore}%</span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-2">{item.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Patterns */}
      <div className="bg-linear-to-br from-gray-900/90 to-cyan-950/90 backdrop-blur-sm p-6 rounded-2xl border border-cyan-500/30">
        <h3 className="text-xl font-semibold text-cyan-300 mb-4">💡 Recommended Patterns</h3>
        <div className="flex flex-wrap gap-3">
          {data.recommendedPatterns.map((p) => (
            <span key={p} className="bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium border border-cyan-500/30">
              {p}
            </span>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-3">Focus on these patterns to improve your skills</p>
      </div>
    </div>
  );
}