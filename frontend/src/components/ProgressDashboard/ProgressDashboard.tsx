// components/ProgressDashboard.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../GlobalAPIURL";

interface ProgressData {
  totalProblems: number;
  averageScore: string;
  streak: number;
  patternAverages: Array<{
    pattern: string;
    average: number;
    count: number;
  }>;
  weeklyProgress: Array<{
    day: string;
    count: number;
    averageScore: number;
  }>;
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
  };
  strongestPattern: string;
  weakestPattern: string;
}

export default function ProgressDashboard({ userId }: { userId: string }) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${API_URL}/progress/${userId}`);
      setProgress(res.data.data);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
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

  if (!progress) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-4">📊</p>
        <p>No progress data yet. Start solving problems!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
          <p className="text-blue-300 text-sm">Problems Solved</p>
          <p className="text-3xl font-bold text-white mt-2">{progress.totalProblems}</p>
        </div>
        <div className="bg-linear-to-br from-gray-900/90 to-green-950/90 backdrop-blur-sm p-6 rounded-2xl border border-green-500/30">
          <p className="text-green-300 text-sm">Average Score</p>
          <p className="text-3xl font-bold text-white mt-2">{progress.averageScore}%</p>
        </div>
        <div className="bg-linear-to-br from-gray-900/90 to-yellow-950/90 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/30">
          <p className="text-yellow-300 text-sm">Streak</p>
          <p className="text-3xl font-bold text-white mt-2">🔥 {progress.streak} days</p>
        </div>
        <div className="bg-linear-to-br from-gray-900/90 to-purple-950/90 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30">
          <p className="text-purple-300 text-sm">Difficulty Breakdown</p>
          <div className="flex gap-2 mt-2">
            <span className="text-green-400">E: {progress.difficultyStats.easy}</span>
            <span className="text-yellow-400">M: {progress.difficultyStats.medium}</span>
            <span className="text-red-400">H: {progress.difficultyStats.hard}</span>
          </div>
        </div>
      </div>

      {/* Pattern Performance */}
      <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
        <h3 className="text-xl font-semibold text-blue-300 mb-4">Pattern Performance</h3>
        <div className="space-y-3">
          {progress.patternAverages.map((item) => (
            <div key={item.pattern} className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-300">{item.pattern}</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-1000 ${
                    item.average >= 80 ? "bg-green-500" :
                    item.average >= 60 ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${item.average}%` }}
                />
              </div>
              <span className="text-sm text-gray-300 w-16 text-right">{item.average}%</span>
              <span className="text-xs text-gray-500">({item.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30">
        <h3 className="text-xl font-semibold text-blue-300 mb-4">Weekly Progress</h3>
        <div className="flex justify-around">
          {progress.weeklyProgress.map((day) => (
            <div key={day.day} className="flex flex-col items-center">
              <div className="h-24 flex items-end">
                <div
                  className="w-8 bg-blue-500 rounded-t transition-all duration-500"
                  style={{ height: `${Math.max(day.count * 20, 4)}px` }}
                />
              </div>
              <span className="text-xs text-gray-400 mt-2">{day.day}</span>
              <span className="text-xs text-gray-500">{day.count} solved</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strongest & Weakest */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-gray-900/90 to-green-950/90 backdrop-blur-sm p-5 rounded-2xl border border-green-500/30">
          <p className="text-green-300 text-sm">💪 Strongest Pattern</p>
          <p className="text-white font-semibold mt-1">{progress.strongestPattern}</p>
        </div>
        <div className="bg-linear-to-br from-gray-900/90 to-red-950/90 backdrop-blur-sm p-5 rounded-2xl border border-red-500/30">
          <p className="text-red-300 text-sm">📉 Weakest Pattern</p>
          <p className="text-white font-semibold mt-1">{progress.weakestPattern}</p>
        </div>
      </div>
    </div>
  );
}