// ProblemInput.tsx
interface ProblemInputProps {
  problem: string;
  setProblem: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onAnalyze: () => void;
}

export default function ProblemInput({
  problem,
  setProblem,
  loading,
  onAnalyze,
}: ProblemInputProps) {
  return (
    <div className="bg-linear-to-br from-gray-900/90 to-blue-950/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/20">
      <textarea
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="Paste your LeetCode problem here..."
        className="w-full h-48 bg-black/50 rounded-lg p-4 outline-none resize-none border border-blue-500/30 focus:border-blue-400 transition-all duration-300 placeholder:text-gray-500 text-white"
      />
      <button
        onClick={onAnalyze}
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
  );
}