// components/ContestCoach.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../GlobalAPIURL";

interface ContestProblem {
  title: string;
  difficulty: string;
  pattern: string;
}

interface ContestSession {
  contestId: string;
  problems: ContestProblem[];
  contestName: string;
  currentProblem: number;
}

export default function ContestCoach({ userId }: { userId: string }) {
  const [session, setSession] = useState<ContestSession | null>(null);
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    timeComplexity: string;
    spaceComplexity: string;
    totalScore: number;
    completed: boolean;
  } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const startContest = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/contest/start`, { userId });
      setSession({
        contestId: res.data.data.contestId,
        problems: res.data.data.problems,
        contestName: res.data.data.contestName,
        currentProblem: 0,
      });
      setResult(null);
      setSolution("");
    } catch (error) {
      console.error("Failed to start contest:", error);
      alert("Failed to start contest");
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async () => {
    if (!session || !solution.trim()) return;

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/contest/submit`, {
        contestId: session.contestId,
        solution,
        problemIndex: session.currentProblem,
      });

      setResult(res.data.data);

      if (res.data.data.completed) {
        // Contest completed
        setSession(null);
        fetchHistory();
        fetchLeaderboard();
      } else {
        // Move to next problem
        setTimeout(() => {
          setSession({
            ...session,
            currentProblem: session.currentProblem + 1,
          });
          setSolution("");
          setResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to submit solution:", error);
      alert("Failed to submit solution");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/contest/history/${userId}`);
      setHistory(res.data.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/contest/leaderboard`);
      setLeaderboard(res.data.data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Start Contest */}
      {!session && !result?.completed && (
        <div className="text-center py-12">
          <button
            onClick={startContest}
            className="px-8 py-4 bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-semibold text-lg shadow-lg shadow-yellow-500/30 transition-all duration-300"
          >
            ⚡ Start Contest
          </button>
          <p className="text-gray-400 mt-4">
            Solve 3 problems with increasing difficulty
          </p>
        </div>
      )}

      {/* Contest Session */}
      {session && (
        <div className="bg-linear-to-br from-gray-900/90 to-yellow-950/90 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-yellow-300">{session.contestName}</h3>
              <p className="text-sm text-gray-400">
                Problem {session.currentProblem + 1} of {session.problems.length}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              session.problems[session.currentProblem].difficulty === "Easy"
                ? "bg-green-500/20 text-green-300"
                : session.problems[session.currentProblem].difficulty === "Medium"
                ? "bg-yellow-500/20 text-yellow-300"
                : "bg-red-500/20 text-red-300"
            }`}>
              {session.problems[session.currentProblem].difficulty}
            </span>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <p className="text-white">{session.problems[session.currentProblem].title}</p>
            <p className="text-gray-400 text-sm mt-1">
              Pattern: {session.problems[session.currentProblem].pattern}
            </p>
          </div>

          {result && !result.completed ? (
            <div className="bg-blue-950/30 border border-blue-500/30 p-4 rounded-lg mb-4">
              <p className="text-green-400">✅ Solution submitted!</p>
              <p className="text-gray-300 mt-2">Score: {result.score}/100</p>
              <p className="text-gray-300">Time: {result.timeComplexity}</p>
              <p className="text-gray-300">Space: {result.spaceComplexity}</p>
              <p className="text-yellow-400 text-sm mt-2">Moving to next problem...</p>
            </div>
          ) : (
            <>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Write your solution here..."
                className="w-full h-32 bg-black/50 rounded-lg p-4 outline-none resize-none border border-yellow-500/30 focus:border-yellow-400 transition-all duration-300 placeholder:text-gray-500 text-white font-mono"
              />
              <button
                onClick={submitSolution}
                disabled={submitting || !solution.trim()}
                className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  submitting || !solution.trim()
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Solution"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Completed Contest */}
      {result?.completed && (
        <div className="bg-linear-to-br from-gray-900/90 to-green-950/90 backdrop-blur-sm p-6 rounded-2xl border border-green-500/30 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <h3 className="text-2xl font-bold text-green-400">Contest Completed!</h3>
          <p className="text-gray-300 mt-2">Total Score: {result.totalScore}</p>
          <button
            onClick={() => {
              setResult(null);
              setSession(null);
            }}
            className="mt-4 px-6 py-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
          >
            Start New Contest
          </button>
        </div>
      )}

      {/* Leaderboard */}
      <div>
        <button
          onClick={() => {
            setShowLeaderboard(!showLeaderboard);
            if (!showLeaderboard) fetchLeaderboard();
          }}
          className="text-yellow-300 hover:text-yellow-200 transition-colors"
        >
          {showLeaderboard ? "Hide Leaderboard" : "🏆 View Leaderboard"}
        </button>

        {showLeaderboard && leaderboard.length > 0 && (
          <div className="mt-4 bg-linear-to-br from-gray-900/90 to-yellow-950/90 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/30">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4">Top Contestants</h4>
            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-yellow-500/20"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${
                      user.rank === 1 ? "text-yellow-400" :
                      user.rank === 2 ? "text-gray-300" :
                      user.rank === 3 ? "text-orange-400" :
                      "text-gray-500"
                    }`}>
                      #{user.rank}
                    </span>
                    <span className="text-white">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-yellow-300 font-semibold">{user.rating}</span>
                    <span className="text-gray-400 text-sm">{user.contests} contests</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) fetchHistory();
          }}
          className="text-blue-300 hover:text-blue-200 transition-colors"
        >
          {showHistory ? "Hide History" : "📜 View Contest History"}
        </button>

        {showHistory && history.length > 0 && (
          <div className="mt-4 space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-4 rounded-xl border border-blue-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className="ml-3 text-sm text-blue-300">{item.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-yellow-400">{item.totalScore} pts</span>
                  <span className="ml-3 text-sm text-gray-400">
                    #{item.rank}
                  </span>
                  <span className="ml-3 text-sm text-gray-400">
                    {item.completed ? "✅" : "⏳"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}