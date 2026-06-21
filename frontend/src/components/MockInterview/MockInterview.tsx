// components/MockInterview.tsx
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../GlobalAPIURL";

interface InterviewSession {
  interviewId: string;
  questions: string[];
  patterns: string[];
  currentQuestion: number;
}

export default function MockInterview({ userId }: { userId: string }) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    completed: boolean;
    overallScore?: number;
  } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const startInterview = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/mock-interview/start`, {
        userId,
        patterns: ["Hash Map", "Two Pointers", "Sliding Window"],
      });
      setSession({
        interviewId: res.data.data.interviewId,
        questions: res.data.data.questions,
        patterns: res.data.data.patterns,
        currentQuestion: 0,
      });
      setFeedback(null);
      setAnswer("");
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !answer.trim()) return;

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/mock-interview/submit`, {
        interviewId: session.interviewId,
        answer,
        questionIndex: session.currentQuestion,
      });

      setFeedback(res.data.data);

      if (res.data.data.completed) {
        // Interview completed
        setSession(null);
        fetchHistory();
      } else {
        // Move to next question
        setTimeout(() => {
          setSession({
            ...session,
            currentQuestion: session.currentQuestion + 1,
          });
          setAnswer("");
          setFeedback(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/mock-interview/history/${userId}`);
      setHistory(res.data.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Start Interview */}
      {!session && !feedback?.completed && (
        <div className="text-center py-12">
          <button
            onClick={startInterview}
            className="px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/30 transition-all duration-300"
          >
            🎤 Start Mock Interview
          </button>
          <p className="text-gray-400 mt-4">
            Practice 3 DSA problems with real-time feedback
          </p>
        </div>
      )}

      {/* Interview Session */}
      {session && (
        <div className="bg-linear-to-br from-gray-900/90 to-purple-950/90 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-purple-300">
              Question {session.currentQuestion + 1} of {session.questions.length}
            </h3>
            <span className="text-sm text-gray-400">
              Pattern: {session.patterns[session.currentQuestion]}
            </span>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <p className="text-white">{session.questions[session.currentQuestion]}</p>
          </div>

          {feedback && !feedback.completed ? (
            <div className="bg-blue-950/30 border border-blue-500/30 p-4 rounded-lg mb-4">
              <p className="text-green-400">✅ Answer submitted!</p>
              <p className="text-gray-300 mt-2">Score: {feedback.score}/100</p>
              <p className="text-gray-300">{feedback.feedback}</p>
              <p className="text-yellow-400 text-sm mt-2">Moving to next question...</p>
            </div>
          ) : (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your solution approach here..."
                className="w-full h-32 bg-black/50 rounded-lg p-4 outline-none resize-none border border-purple-500/30 focus:border-purple-400 transition-all duration-300 placeholder:text-gray-500 text-white"
              />
              <button
                onClick={submitAnswer}
                disabled={submitting || !answer.trim()}
                className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  submitting || !answer.trim()
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Completed Interview */}
      {feedback?.completed && (
        <div className="bg-linear-to-br from-gray-900/90 to-green-950/90 backdrop-blur-sm p-6 rounded-2xl border border-green-500/30 text-center">
          <p className="text-4xl mb-4">🎉</p>
          <h3 className="text-2xl font-bold text-green-400">Interview Completed!</h3>
          <p className="text-gray-300 mt-2">Overall Score: {feedback.overallScore}/100</p>
          <button
            onClick={() => {
              setFeedback(null);
              setSession(null);
            }}
            className="mt-4 px-6 py-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
          >
            Start New Interview
          </button>
        </div>
      )}

      {/* History */}
      <div>
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) fetchHistory();
          }}
          className="text-blue-300 hover:text-blue-200 transition-colors"
        >
          {showHistory ? "Hide History" : "📜 View Interview History"}
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
                  <span className="ml-3 text-sm text-blue-300">
                    {item.patterns.join(", ")}
                  </span>
                </div>
                <div>
                  <span className={`font-semibold ${
                    item.score >= 80 ? "text-green-400" :
                    item.score >= 60 ? "text-yellow-400" :
                    "text-red-400"
                  }`}>
                    {item.score}%
                  </span>
                  <span className="ml-3 text-sm text-gray-400">
                    {item.completed ? "✅ Completed" : "⏳ In Progress"}
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